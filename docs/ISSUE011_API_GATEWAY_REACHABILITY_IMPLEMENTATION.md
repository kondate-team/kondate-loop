# Issue #011 API Gateway 到達性修正メモ (2026-02-14)

## 目的
- `API Gateway -> Lambda` の経路を常に最新定義で反映させる。
- `POST /v1/recipes` が `403 Missing Authentication Token` になる事象を解消する。

## 背景
- 既存構成は `API Gateway + Lambda + DynamoDB` まで作成済み。
- 直近の CI ログでは、Lambda 直接 invoke は成功する一方で API Gateway 経由が 403 だった。
- 原因は `AWS::ApiGateway::Deployment` が更新されず、ステージに新しいリソース定義が反映されない可能性が高い。

## 実装内容
1. `infra/aws-resources/kondate-loop-backend-stack.yaml`
- `Parameters` に `ApiDeploymentVersion` を追加。
- `BackendApiDeployment.Properties.Description` に `deployment-${ApiDeploymentVersion}` を追加。

3. `.github/workflows/deploy.yml`
- backend stack の `PARAM_OVERRIDES` に `ApiDeploymentVersion=${GITHUB_SHA}` を追加。
- これにより deploy ごとに API Gateway Deployment の世代が更新される。

## 期待結果
- deploy 後に API Gateway ステージへ最新ルートが反映される。
- `BackendApiEndpoint` に対する `POST {base}/recipes` が Lambda へ到達する。

## 確認ポイント
- GitHub Actions `Deploy` の `backend-dev` で API 呼び出しが fallback なしで成功すること。
- CloudWatch Logs で API Gateway 経由の Lambda 実行ログが確認できること。
