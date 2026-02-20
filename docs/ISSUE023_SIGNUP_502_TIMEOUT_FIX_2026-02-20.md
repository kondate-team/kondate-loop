# Issue #023 signup 502 修正記録 (2026-02-20)

## 事象
- CloudFront 経由の画面操作で `POST /v1/auth/signup` が `502 Internal server error` になるケースが発生。
- ただし同じメールで直後に `POST /v1/auth/login` は `200` になり、再度 `signup` すると `User already exists` になるため、Cognito 側では登録済みになる事象を確認。

## 原因
- `signup` は Cognito 呼び出し回数が多く、Lambda 初回実行時に遅延しやすい。
- CloudFormation テンプレートの Lambda 設定で `Timeout` 未指定だったため、デフォルト 3 秒でタイムアウトする可能性があった。
- さらに `signup` 成功後に `GetUser` を追加で呼んでおり、処理時間と失敗点が増えていた。

## 修正内容
### 1. API 実装の呼び出し最適化
- `apps/api/src/server.ts`
  - `cognitoSignUpAndAuthenticate` の戻り値を `identity + tokenSet` に変更。
  - `SignUpCommand` の `UserSub` がある場合は `GetUser` を呼ばずにそのまま `identity` を構築。
  - `UserSub` が取れない場合のみ `GetUser` にフォールバック。
  - `POST /v1/auth/signup` での重複 `GetUser` 呼び出しを削減。

### 2. Lambda 実行設定の明示
- `infra/aws-resources/kondate-loop-backend-stack.yaml`
- `infra/aws-resources/PROD/PRODkondate-loop-backend-stack.yaml`
  - `MemorySize: 512`
  - `Timeout: 15`

## ローカル検証
- `npm run build --workspace=apps/api` : 成功
- `npm run smoke:api --workspace=apps/api` : 成功

## 期待効果
- `signup` 初回実行時のタイムアウト由来 502 の発生確率低減。
- Cognito 登録後レスポンスまでの安定性向上。
