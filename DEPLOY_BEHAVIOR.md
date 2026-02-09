# Deploy Behavior Summary

対象Workflow: `.github/workflows/deploy.yml`

## 1. `feature/*` に Push したとき

- トリガー: `on.push.branches` の `feature/**`
- 実行ジョブ: `backend-dev` のみ
- CloudFormation 反映:
  - `kondate-loop-backend-stack` のみ（`infra/aws-resources/kondate-loop-backend-stack.yaml`）
  - 環境は `dev`
- 実行されないもの:
  - `frontend-dev`（`dev` ブランチ限定のため）
  - `prod`（`main` ブランチ限定のため）

## 2. `dev` にマージしたとき

マージコミットで `dev` に push が発生すると、以下が動く。

- 実行ジョブ:
  - `backend-dev`
  - `frontend-dev`（`needs: backend-dev`）
- CloudFormation 反映（dev一式）:
  - `kondate-loop-iam-github-oidc-stack`
  - `kondate-loop-iam-LambdaExecutionRole-stack`
  - `kondate-loop-iam-stack`（`DEVELOPER_PRINCIPAL_ARN` 未設定時はスキップ）
  - `kondate-loop-infra-stack-dev` 相当（`CFN_STACK_NAME_DEV` 等で上書き可）
  - `kondate-loop-backend-stack`
- フロント反映:
  - `apps/web` をビルドして dev 用 S3 バケットへ `aws s3 sync`

## 3. `main` にマージしたとき

マージコミットで `main` に push が発生すると、以下が動く。

- 実行ジョブ: `prod` のみ
- CloudFormation 反映（prod）:
  - `PROD` テンプレートの infra スタック
  - `PRODkondate-loop-backend-stack`
- フロント反映:
  - `apps/web` をビルドして prod 用 S3 バケットへ `aws s3 sync`
- 実行されないもの:
  - `backend-dev`
  - `frontend-dev`

## 補足

- `workflow_dispatch` の `allow_stack_delete=true` は dev 系（`backend-dev`）でのみ有効。
- 実行条件はすべてブランチ名（`github.ref`）で判定されるため、PRマージでも最終的に push 先ブランチの条件が適用される。
