# Issue #020 dev反映後 動作確認手順（2026-02-20）

## 1. 目的
- `dev` に取り込まれた API/フロント変更が、実環境（dev）で期待どおり動作することを確認する。
- 確認観点を固定し、次回以降も同じ手順で再実行できる状態にする。

## 2. 対象
- 認証API
  - `POST /v1/auth/callback`
  - `POST /v1/auth/refresh`
  - `POST /v1/auth/logout`
  - `GET /v1/auth/me`
- Payment/Notification 系の既存反映結果
- フロントの API 接続（`apps/web/src/services/auth.ts`）

## 3. 実施順序

### 3-1. CI確認（必須）
1. `dev` の最新コミットに対して以下が `success` であることを確認
   - `Deploy`
   - `Deploy dev to GitHub Pages`
2. `Deploy` の `backend-dev` ジョブで以下が成功していることを確認
   - CloudFormation デプロイ
   - API スモーク（API Gateway 経由 + DynamoDB 反映）

### 3-2. API手動確認（必須）
1. テストユーザーIDを1つ決める（例: `verify-user-20260220`）
2. 以下を順に実行し、すべて 2xx を確認
   - `POST /v1/auth/callback`
   - `POST /v1/auth/refresh`
   - `POST /v1/auth/logout`
   - `GET /v1/auth/me`
3. `refreshToken` が callback/refresh で返ることを確認
4. `logout` が `loggedOut=true` を返すことを確認

### 3-3. データ反映確認（必須）
1. API経由で書き込み（例: `POST /v1/recipes`）
2. API経由で読み出し（例: `GET /v1/recipes?userId=...`）
3. 作成データが取得できることを確認

### 3-4. フロント確認（任意だが推奨）
1. `VITE_API_USE_MOCK=false` で起動
2. `VITE_API_BASE_URL` を dev API Gateway に設定
3. 画面操作で認証導線を確認し、Network タブで `/v1/auth/*` が 2xx であることを確認

## 4. 受け入れ条件
- CI 2本（Deploy / Deploy dev to GitHub Pages）が成功
- 認証API 4本が 2xx
- 書き込み→読み出しで反映確認が取れる
- 重大エラー（5xx, CORS, 認証失敗）がない

## 5. 実施ログ
- 実施日: 2026-02-20
- ブランチ: `feature/020-dev-verification`
- 実施者: Codex
- 備考:
  - 本ドキュメントは「今後の再実行手順」として保持する。
  - 実測結果は必要に応じて追記する。

### 5-1. 実測結果（2026-02-20）

#### 3-1 CI確認
- `dev` 最新SHA: `aa08659dbdc12651aafda66134287afb6e5a20b9`
- `Deploy`:
  - Run: `22214962110`
  - 結果: `success`
  - `backend-dev` 内の `Deploy CloudFormation (dev)` と `Smoke test backend API -> DynamoDB (dev)` が成功
- `Deploy dev to GitHub Pages`:
  - Run: `22214962092`
  - 結果: `success`

#### 3-2 API手動確認（API Gateway経由）
- 使用エンドポイント:
  - `https://9xgpv0z4r7.execute-api.ap-northeast-1.amazonaws.com/dev/v1`
- 結果（すべて 2xx）:
  - `POST /auth/callback` → `200`
  - `POST /auth/refresh` → `200`
  - `POST /auth/logout` → `200`
  - `GET /auth/me` → `200`
- 返却値確認:
  - callback/refresh で `accessToken` と `refreshToken` を確認
  - logout で `loggedOut=true` / `revokedRefreshToken=true` を確認

#### 3-3 データ反映確認
- `POST /recipes`（`userId=verify-user-20260220`）→ `201`
- `GET /recipes?userId=verify-user-20260220` → `200`
- 作成した `recipeId` が一覧で取得できることを確認（反映OK）

#### 3-4 フロント確認
- 未実施（必要時に別途実施）
