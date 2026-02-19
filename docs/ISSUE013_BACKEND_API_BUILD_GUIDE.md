# Issue #013 バックエンドAPI構築（AWS）手順書

目的: AWS 上に `API Gateway + Lambda + DynamoDB` のバックエンドを作成し、CI（GitHub Actions）から継続デプロイできる状態にする。

対象Issue: #013  
説明: バックエンドAPI構築

## 1. 全体像（このリポジトリの前提）

- アプリコード（Lambda 実体）: `apps/api`（TypeScript）
- デプロイ方式: CloudFormation + GitHub Actions（OIDC）
- 構成（dev/prod 共通の考え方）
  - API Gateway (REST): `/v1` と `/v1/{proxy+}`（＋ root `/{proxy+}`）を Lambda プロキシ統合（AWS_PROXY）で 1 本の Lambda に集約
  - Lambda: `kondate-loop-<env>-api-fn-proxy`
  - DynamoDB: `kondate-loop-<env>-data-ddb-main`

重要: CloudFormation の `LambdaCodeS3Key` が空だと、Lambda は placeholder コードで動く。実 API を動かすには zip を S3 に置き、パラメータで渡す。

## 2. 事前準備

### 2.1 必要なもの

- AWS アカウント（dev/prod）
- GitHub Actions から AssumeRole できる IAM Role（OIDC）
- CloudFormation デプロイ用 S3 バケット（Artifacts）
- リージョン: 原則 `ap-northeast-1`（workflow が固定）

### 2.2 参照ファイル

- デプロイフロー: `.github/workflows/deploy.yml`
- スタック定義:
  - `infra/aws-resources/kondate-loop-iam-github-oidc-stack.yaml`
  - `infra/aws-resources/kondate-loop-iam-LambdaExecutionRole-stack.yaml`
  - `infra/aws-resources/kondate-loop-iam-stack.yaml`（任意: `DEVELOPER_PRINCIPAL_ARN` があるときのみ）
  - `infra/aws-resources/kondate-loop-infra-stack.yaml`
  - `infra/aws-resources/kondate-loop-backend-stack.yaml`
- バックエンドの Lambda ハンドラ: `apps/api/src/lambda.ts`

## 3. 手順（推奨: GitHub Actions で構築する）

このリポジトリは、push をトリガーに GitHub Actions が CloudFormation を順に適用する前提で整備されている。

### 3.1 GitHub Secrets / Variables を準備

最低限（dev）:

- Secrets
  - `AWS_ROLE_ARN_DEV`: dev にデプロイするための AssumeRole ARN

あれば上書き可能（dev）:

- Secrets/Vars（どちらでも読みにいくものがある）
  - `CFN_EXEC_ROLE_ARN_DEV`: CloudFormation 実行ロール（任意）
  - `CFN_STACK_NAME_DEV`: infra スタック名上書き（任意）
  - `CFN_ARTIFACT_BUCKET_DEV`: Artifacts バケット（任意）
  - `FRONTEND_BUCKET_DEV`: dev のフロント配信用 S3（任意）
  - `BACKEND_CODE_BUCKET_DEV`: backend lambda zip を置く S3（任意。未設定時は Artifacts bucket にフォールバック）
  - `DEVELOPER_PRINCIPAL_ARN`: `kondate-loop-iam-stack` を適用する場合に必要（未設定なら、そのスタックはスキップ）
  - `DDB_ENABLE_GSI1_DEV` / `DDB_ENABLE_GSI2_DEV` / `DDB_ENABLE_GSI3_DEV`: GSI 段階適用の制御（未設定なら `true/false/false`）

prod の最低限:

- Secrets
  - `AWS_ROLE_ARN`: prod にデプロイするための AssumeRole ARN

### 3.2 dev にデプロイ（feature ブランチ）

1. ブランチを `feature/**` で作成して push
2. Actions の `Deploy` が起動し、`backend-dev` が走る（dev 環境）
3. feature ブランチでは以下が適用される（`deploy.yml` の分岐）
   - `kondate-loop-iam-github-oidc-stack`
   - `kondate-loop-backend-stack`

補足:
- feature ブランチは「バックエンド周りだけを素早く回す」用途（フロントはデプロイされない）

### 3.3 dev にデプロイ（dev ブランチ）

`dev` へ push すると `backend-dev` → `frontend-dev` の順で動く。

CloudFormation は概ね以下を適用する:

- `kondate-loop-iam-github-oidc-stack`
- `kondate-loop-iam-LambdaExecutionRole-stack`
- `kondate-loop-iam-stack`（`DEVELOPER_PRINCIPAL_ARN` がある場合のみ）
- `kondate-loop-infra-stack-dev` 相当（`CFN_STACK_NAME_DEV` 等で上書き可）
- `kondate-loop-backend-stack`

### 3.4 backend lambda zip の作成とアップロード（CI 内で自動）

`deploy.yml` の `Build and upload backend lambda (dev)` がやっていること:

1. `npm ci`
2. `npm run build --workspace=apps/api`（`tsc`）
3. zip を作成（`dist` + `node_modules` + `package.json`）
4. S3 に `backend/${GITHUB_SHA}/backend-lambda.zip` としてアップロード
5. CloudFormation に以下をパラメータで渡す
   - `LambdaCodeS3Bucket`
   - `LambdaCodeS3Key`
   - `LambdaHandler=dist/lambda.handler`

ポイント:
- `LambdaHandler` は `apps/api/src/lambda.ts` のビルド成果物 `dist/lambda.js` を指す必要がある
- `LambdaCodeS3Key` が空だと placeholder が使われる（実装が反映されない）

### 3.5 API Gateway 反映（Deployment の更新）

API Gateway は `AWS::ApiGateway::Deployment` が更新されないと、ステージにルートが反映されず `403 Missing Authentication Token` になり得る。

このリポジトリでは以下で対策している:

- `infra/aws-resources/kondate-loop-backend-stack.yaml`
  - `ApiDeploymentVersion` パラメータ
  - `AWS::ApiGateway::Deployment` の `Description` に `deployment-${ApiDeploymentVersion}`（必要なら `LambdaCodeS3Key` も）を含めて、デプロイごとに更新させる
  - それでも反映されない場合は `AWS::ApiGateway::Deployment` の Logical ID を変更して作り直す（例: `BackendApiDeploymentV2`）
- `.github/workflows/deploy.yml`
  - `ApiDeploymentVersion=${GITHUB_SHA}` を毎回渡す

## 4. デプロイ後の確認

### 4.1 CloudFormation Outputs の確認

`kondate-loop-backend-stack` の Outputs:

- `BackendApiEndpoint`: `https://.../{env}/v1` まで含む
- `MainTableName`: `kondate-loop-dev-data-ddb-main` のようなテーブル名
- `BackendFunctionArn`

### 4.2 API 疎通（よくある落とし穴）

- `BackendApiEndpoint` 自体がすでに `/v1` を含むため、クライアント側でさらに `/v1/...` を足すと `.../v1/v1/...` になって失敗する。

例（dev）:

- OK: `{BackendApiEndpoint}/recipes`
- NG になりがち: `{BackendApiEndpoint}/v1/recipes`

### 4.3 DynamoDB 書き込み確認（CI のスモークと同等）

CI は以下の流れで検証している:

1. `POST {BackendApiEndpoint}/recipes` を試す（複数URL候補でリトライ）
2. 失敗したら Lambda 直接 invoke にフォールバック
3. DynamoDB に `PK=USER#gha-smoke-...` / `SK=RECIPE#...` が存在するか `GetItem` で確認

## 5. トラブルシュート

- Lambda が placeholder のまま
  - `LambdaCodeS3Key` が空のままデプロイされていないか確認
  - `LambdaHandler=dist/lambda.handler` が渡っているか確認
- API Gateway 経由が 403
  - `ApiDeploymentVersion` が更新されているか確認（デプロイごとに値が変わる必要がある）
  - CloudFormation の `AWS::ApiGateway::Deployment` が更新されているか（`Description` が変わる/必要なら Logical ID 変更で作り直す）確認
- GSI の作成/削除で CloudFormation が失敗
  - DynamoDB は 1 回の更新で作れる/消せる GSI が制限されるため、`EnableGSI1/2/3` を段階的に切り替える


## 6. ローカル動作確認で確認できたこと（2026-02-15）

前提: `npm.cmd run dev:api` で `apps/api/src/server.ts`（Express）をローカル起動し、`Driver: file`（`DATA_STORE_DRIVER=file`）で検証。

確認できたこと:
- APIサーバーが起動してHTTPで到達できる（`GET /health` が `{"ok":true}`）
- `POST /v1/recipes` が動き、JSONがパースされ、`201` で `data.id` が返る（作成処理まで動作）
- `GET /v1/recipes?userId=...` が動き、指定 `userId` の一覧が返る
- `GET /v1/recipes/:id?userId=...` が動き、作成した `id` が取得できる（保存と取得の整合が取れている）

注意:
- `GET /v1/recipes/:id` は `userId + id` の組み合わせで検索するため、`userId` が違うと `Recipe not found` になる。
- file driver の保存先は `apps/api/data/store.json`。

まだ確認できていないこと（次の段階）:
- `DATA_STORE_DRIVER=dynamo`（DynamoDB）で同様にCRUDできるか
- API Gateway 経由で同様に到達・CRUDできるか（AWSデプロイ後の確認）

## 7. 追加確認結果（2026-02-19）

### 7.1 API Gateway 経由の確認（実施済み）

- 確認対象エンドポイント: `https://9xgpv0z4r7.execute-api.ap-northeast-1.amazonaws.com/dev/v1`
- ローカル端末からの実行結果:
  - `POST /recipes`: 成功
  - `GET /recipes?userId=...`: 成功
  - `PATCH /recipes/:id`: 成功
  - `DELETE /recipes/:id`: 成功
  - `GET /recipes/:id?userId=...`: `404 Recipe not found` を再現（同一 `userId/id` 指定でも発生）

補足:
- GitHub Actions 実行 `22032866866`（2026-02-15）でも `POST .../recipes -> 201` と DynamoDB 書き込み確認 (`PK/SK`) は成功している。

### 7.2 `DATA_STORE_DRIVER=dynamo` のローカル確認（完了）

- 実行:
  - `DATA_STORE_DRIVER=dynamo`
  - `TABLE_NAME=kondate-loop-dev-data-ddb-main`
  - `npm.cmd run smoke:api --workspace=apps/api`
- 結果:
  - 1回目: `POST /v1/recipes` で `500`（`Could not load credentials from any providers`）
  - 認証設定後の再実行: `POST /v1/recipes` で `500`（`dynamodb:PutItem` 権限不足）
  - 具体的なエラー:
    - `User: arn:aws:iam::211669976488:user/yuuka.nagatake is not authorized to perform: dynamodb:PutItem on resource: arn:aws:dynamodb:ap-northeast-1:211669976488:table/kondate-loop-dev-data-ddb-main`
- 判定:
  - DynamoDB ドライバ実装不備ではなく、ローカル実行ユーザーの IAM 権限不足が主要因。
  - 最低でも対象テーブルへの `dynamodb:PutItem/GetItem/UpdateItem/DeleteItem/Query` が必要。
  - `kondate-loop-iam-stack.yaml` の `DevAccessRole` 更新を反映しても、実行元 IAM ユーザーに `sts:AssumeRole`（to `DevAccessRole`）許可がないと権限は有効化されない。
  - `AWS_PROFILE=devaccess`（role_arn + mfa_serial）を Node.js(AWS SDK v3) から直接使うと、MFAコード入力コールバックが無く `Profile devaccess requires multi-factor authentication` で失敗する。ローカル検証時は `aws sts assume-role --token-code ...` で一時クレデンシャルを発行し、`AWS_ACCESS_KEY_ID/SECRET_ACCESS_KEY/SESSION_TOKEN` を環境変数で渡す。

- 最終確認（2026-02-19）:
  - `aws configure export-credentials --profile devaccess --format env-no-export` で一時クレデンシャルを環境変数へ設定
  - その状態で `npm.cmd run smoke:api --workspace=apps/api` を実行し、`Smoke API test passed.` を確認
