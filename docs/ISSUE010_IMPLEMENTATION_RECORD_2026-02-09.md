# Issue #010 実装記録（2026-02-09）

## 1. 何を実装したか

### 1.1 DynamoDB キー設計の実装
- `apps/api/src/db/keys.ts` を追加し、PK/SK プレフィックスと GSI キー生成関数を実装。
- `apps/api/src/db/types.ts` を追加し、`User / Recipe / Set / Plan / Shopping / Fridge` の型と `DataStore` インターフェースを定義。
- `apps/api/src/db/fileStore.ts`（ローカルJSON）と `apps/api/src/db/dynamoStore.ts`（DynamoDB）を実装。
- `apps/api/src/db/storeFactory.ts` で `DATA_STORE_DRIVER=file|dynamo` を切り替え可能にした。

### 1.2 API 側の実装
- `apps/api/src/server.ts` をリポジトリ経由に統一。
- `recipes / sets / plan / shopping-list / fridge` の CRUD エンドポイントを実装。
- `apps/api/src/lambda.ts` を追加し、`serverless-http` で Lambda ハンドラを公開。

### 1.3 インフラ側の実装
- `infra/aws-resources/kondate-loop-backend-stack.yaml`
- `infra/aws-resources/PROD/PRODkondate-loop-backend-stack.yaml`
  - `MainTable` に GSI1/GSI2/GSI3 を追加。
  - GSI は段階適用できるよう `EnableGSI1/2/3` パラメータで制御。
  - Lambda 環境変数に `DATA_STORE_DRIVER=dynamo` を追加。
  - Lambda コードのS3バケットを `LambdaCodeS3Bucket` で上書きできるようにした。

### 1.4 GitHub Actions（Deploy）改善
- `.github/workflows/deploy.yml`
  - backend-dev で `apps/api` を build して Lambda zip を作成。
  - zip をS3へアップロードし、CloudFormationに `LambdaCodeS3Bucket/LambdaCodeS3Key/LambdaHandler` を渡してデプロイ。
  - post-deploy smoke を追加し、`/recipes` 書き込み -> DynamoDB `GetItem` を確認。
  - API Gateway 経由で 403 の場合は Lambda invoke フォールバックで同等検証。
  - feature ブランチ時にも `kondate-loop-iam-github-oidc-stack` を先に更新。

### 1.5 IAM 権限の補強
- `infra/aws-resources/kondate-loop-iam-github-oidc-stack.yaml`
  - GitHub Deploy Role(Dev) に以下を追加:
    - `lambda:InvokeFunction`（dev API Lambda）
    - `dynamodb:GetItem` / `dynamodb:Query`（dev MainTable）

## 2. 反映済みの主要コミット（feature/010-DB詳細実装）
- `c0c329d`: Issue #010 の初期実装（db層・API拡張・GSI定義）
- `9fec448`: GSI 段階適用化
- `8a4493d`: Lambda 実コード配備・dynamo driver 化
- `d791776`: backend code bucket fallback 修正
- `14f0f22`: artifact bucket 経由アップロード対応
- `aa2476b`: smoke URL候補の強化
- `be1c6f7`: smoke の YAML/シェル記述修正
- `4afaa7f`: OIDC role 権限追加 + feature deploy で OIDC stack 更新

## 3. 手動テスト（AWS コンソール）手順

### 3.1 前提
- 対象環境: `dev`
- 対象テーブル: `kondate-loop-dev-data-ddb-main`
- 対象Lambda: `kondate-loop-dev-api-fn-proxy`
- 対象スタック: `kondate-loop-backend-stack`

### 3.2 CloudFormation で反映確認
1. AWS コンソール -> CloudFormation -> `kondate-loop-backend-stack` を開く。
2. `Resources` で `MainTable` と `BackendFunction` が `UPDATE_COMPLETE` であることを確認。
3. `Outputs` で `BackendApiEndpoint` と `MainTableName` を確認。

### 3.3 DynamoDB で GSI とデータ確認
1. DynamoDB -> Tables -> `kondate-loop-dev-data-ddb-main` を開く。
2. `Indexes` タブで `GSI1`, `GSI2`（必要なら `GSI3`）が `ACTIVE` か確認。
3. `Explore table items` で以下を条件に検索:
   - `PK` begins with `USER#gha-smoke-`
4. 該当アイテムの `SK` が `RECIPE#...` 形式で存在することを確認。

### 3.4 Lambda 実コード反映確認
1. Lambda -> `kondate-loop-dev-api-fn-proxy` を開く。
2. `Configuration` -> `Environment variables` で以下を確認:
   - `TABLE_NAME=kondate-loop-dev-data-ddb-main`
   - `DATA_STORE_DRIVER=dynamo`
3. `Code` タブで最新更新時刻が直近デプロイ時刻になっていることを確認。

### 3.5 API Gateway 経路の確認（現状注意）
1. API Gateway -> 対象API -> `Resources` で `/v1` と `/{proxy+}` のメソッド設定を確認。
2. 現在、`BackendApiEndpoint + /recipes` 直叩きは `403 Missing Authentication Token` になるケースがある。
3. そのため CI では Lambda invoke フォールバックで DB 書き込み検証を通している。

## 4. 現在の状態（2026-02-09時点）
- `Deploy` run: `21822681969` は `success`。
- `backend-dev` ジョブで smoke 成功ログを確認済み:
  - `Smoke test passed: USER#gha-smoke-21822681969 / RECIPE#59f8a45c-e88c-4280-9a68-63f847eb4bc0`
- 直近の課題:
  - API Gateway 経由 `/v1/recipes` が `403 Missing Authentication Token` になる原因調査が残っている。
