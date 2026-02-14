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

## GSI staged rollout for backend stack (2026-02-09)
- CloudFormation update for DynamoDB supports only one GSI create/delete per update.
- `kondate-loop-backend-stack` / `PRODkondate-loop-backend-stack` now use parameters:
  - `EnableGSI1` default `true`
  - `EnableGSI2` default `false`
  - `EnableGSI3` default `false`
- `deploy.yml` forwards repo vars for staged rollout:
  - dev: `DDB_ENABLE_GSI1_DEV`, `DDB_ENABLE_GSI2_DEV`, `DDB_ENABLE_GSI3_DEV`
  - prod: `DDB_ENABLE_GSI1_PROD`, `DDB_ENABLE_GSI2_PROD`, `DDB_ENABLE_GSI3_PROD`
- Enable indexes one by one across separate deploys.

## Backend runtime and verification update (2026-02-09)
- Backend Lambda now runs deployed API code from S3 package (not placeholder code).
- `kondate-loop-backend-stack` template sets `DATA_STORE_DRIVER=dynamo` and `TABLE_NAME` in Lambda env.
- Deploy workflow (`backend-dev`) now:
  1) builds `apps/api`
  2) packages lambda artifact (`dist + node_modules + package.json`)
  3) uploads to backend code bucket
  4) deploys with `LambdaCodeS3Key` and `LambdaHandler=dist/lambda.handler`
  5) runs smoke test: `POST /recipes` and verifies DynamoDB item exists.
- Backend code bucket fallback name updated to `kondate-loop-<env>-s3-lcode-<accountId>-<region>` (was `...-lambda-code-...`).
- Lambda code upload target now falls back to CloudFormation artifacts bucket to avoid backend-code bucket IAM gaps.
- Backend stack deploy passes `LambdaCodeS3Bucket` + `LambdaCodeS3Key` explicitly.
- Feature branch deploy now updates `kondate-loop-iam-github-oidc-stack` before backend stack to keep GitHub OIDC role permissions aligned with backend smoke checks.

## Prod credential resolution update (2026-02-14)
- `prod` job uses only repository variable `AWS_ROLE_ARN_PROD` for OIDC role resolution.
- If `AWS_ROLE_ARN_PROD` is not configured, the workflow logs a warning and skips prod deploy/build/upload steps instead of failing at `configure-aws-credentials`.
- This allows `main` push (including merge commits from `dev`) to complete successfully even when prod OIDC role settings are not yet configured.

## Prod frontend build compatibility update (2026-02-14)
- `prod` frontend build step now supports both repository layouts:
  - monorepo root with `package.json` (workspace build)
  - legacy layout without root `package.json` (build in `apps/web` directly)
- This prevents `npm ci` ENOENT failures on `main` when only `apps/web/package.json` exists.
