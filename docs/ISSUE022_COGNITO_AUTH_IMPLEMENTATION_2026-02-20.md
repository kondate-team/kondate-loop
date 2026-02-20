# Issue #022 Cognito認証実装記録 (2026-02-20)

## 目的
- dev環境でユーザー認証を Cognito ベースに切り替える。
- フロントのログイン/新規登録画面操作で、実際にバックエンド経由で Cognito 認証を行う。

## 実装内容

### 1. API (`apps/api/src/server.ts`)
- Cognito連携を追加:
  - `POST /v1/auth/signup`
  - `POST /v1/auth/login`
  - `POST /v1/auth/refresh` (Cognito `REFRESH_TOKEN_AUTH`)
  - `POST /v1/auth/logout` (Cognito `GlobalSignOut` / `RevokeToken`)
  - `GET /v1/auth/me` (Bearer access token から `GetUser`)
- 既存エンドポイントとの互換:
  - `/v1/auth/callback`, `/v1/auth/refresh`, `/v1/auth/logout` の既存パスは維持。
  - Cognito未設定時は既存スタブ動作を維持してローカル開発を継続可能。
- エラーマッピング:
  - Cognito例外名に応じて 400/401/500 を返す。

### 2. API依存関係 (`apps/api/package.json`)
- 追加: `@aws-sdk/client-cognito-identity-provider`

### 3. フロント認証呼び出し
- `apps/web/src/services/auth.ts`
  - `login()` を `POST /v1/auth/login` 呼び出しへ変更
  - `signup()` を `POST /v1/auth/signup` 呼び出しへ変更
- `apps/web/src/App.tsx`
  - ログイン/新規登録の画面ハンドラを API 呼び出しに接続
  - 失敗時は API エラーをパースして `auth-error` 画面へ表示
  - ログアウト時に `logout()` API を呼ぶよう変更

### 4. インフラ (CloudFormation)
- 追加リソース:
  - `AWS::Cognito::UserPool`
  - `AWS::Cognito::UserPoolClient`
- 反映先:
  - `infra/aws-resources/kondate-loop-backend-stack.yaml` (dev)
  - `infra/aws-resources/PROD/PRODkondate-loop-backend-stack.yaml` (prod)
- Lambda環境変数:
  - `COGNITO_USER_POOL_ID`
  - `COGNITO_CLIENT_ID`
  - `COGNITO_REGION`
- Lambda実行ロールに `cognito-idp:*` 必要最小権限を追加。
- Outputs:
  - `CognitoUserPoolId`
  - `CognitoUserPoolClientId`

### 5. dev配信フロントの実API固定
- `ci: dev配信フロントを実API接続でビルド` の変更を取り込み。
  - `deploy.yml` / `pages-dev.yml` で `VITE_API_USE_MOCK=false` を注入
  - `VITE_API_BASE_URL` を dev API に注入

## 検証結果
- `npm run build --workspace=apps/api` : 成功
- `npm run smoke:api --workspace=apps/api` : 成功
- `npm run build --workspace=packages/types` : 成功
- `npm run build --workspace=apps/web` (実API設定あり) : 成功

## 現時点の制約
- 認証エンドポイントは Cognito 化したが、業務API全体に JWT 強制をかける段階までは未実装。
  - 多くの `/v1/*` は従来通り `userId` パラメータ運用のまま。
- Hosted UI / OAuthコード交換フローは未実装。
  - 本実装は email+password の Cognito 認証をバックエンド経由で扱う方式。

## Follow-up update (2026-02-20)
- Added Cognito JWT guard middleware in `apps/api/src/server.ts`.
- When Cognito env is configured, all `/v1/*` business routes now require `Authorization: Bearer <accessToken>` except health, auth bootstrap endpoints (`/v1/auth/signup|login|callback|refresh|logout` and `/auth/*`), and public share read endpoints (`/v1/share/recipe/:id`, `/v1/share/set/:id`).
- Request identity for business APIs is now resolved from verified token claims (`resolveUserId` / `resolveUserEmail`) to prevent spoofed `userId` in body/query/header.
- Frontend API client now automatically adds bearer token from local storage (`apps/web/src/api/client.ts` + `apps/web/src/services/authStorage.ts`).
- Remaining scope: API Gateway-level Cognito Authorizer and Hosted UI/OAuth code-exchange flow.
