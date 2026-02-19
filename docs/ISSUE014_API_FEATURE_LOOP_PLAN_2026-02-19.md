# Issue #014 API機能追加ループ計画（2026-02-19）

## 1. 目的
- API機能追加ループ（実装 -> ローカルテスト -> AWSデプロイ -> AWSスモーク）を回すための実装順とブランチ単位を確定する。

## 2. 判定元
- 実装コード: `apps/api/src/server.ts`
- 永続層: `apps/api/src/db/dynamoStore.ts`, `apps/api/src/db/types.ts`
- 仕様一覧: `docs/仕様まとめ_詳細な読み取り.md`（6-1 〜 6-12）

## 3. 現在実装済み API（server.ts）
### 3.1 既存で動いている主機能
- Recipe: `GET/POST /v1/recipes`, `GET/PATCH/DELETE /v1/recipes/:id`
- Set: `GET/POST /v1/sets`, `GET/PATCH/DELETE /v1/sets/:id`
- Plan: `GET /v1/plan`, `POST /v1/plan/select-set`, `PATCH /v1/plan/items/:id`
- Shopping: `GET /v1/shopping-list`, `POST /v1/shopping-list/items`, `PATCH /v1/shopping-list/items/:id`, `POST /v1/shopping-list/complete`
- Fridge: `GET /v1/fridge`, `POST /v1/fridge/items`, `PATCH/DELETE /v1/fridge/items/:id`, `GET /v1/fridge/deleted`, `POST /v1/fridge/items/:id/restore`
- Subscription/Payment(一部): `POST /v1/payment-methods`, `POST /v1/subscriptions`, `DELETE /v1/subscriptions`

### 3.2 仕様外だが既にあるエンドポイント
- Connect/Stripe連携: `POST /v1/connect/accounts`, `POST /v1/connect/account-links`, `GET /v1/connect/accounts/:userId`, `POST /v1/connect/login-links`
- 購入系派生: `POST /v1/purchases/plan`, `POST /v1/purchases/content`
- User参照: `GET /v1/users/:userId`

## 4. 未実装 API（仕様との差分）
### 4.1 優先度A（Coreギャップ埋め）
- `POST /v1/plan/advance`
- `DELETE /v1/shopping-list/items/{id}`
- `POST /v1/import/parse`

### 4.2 優先度B（認証/ユーザー）
- `GET /v1/auth/me`（または仕様まとめ側の `/auth/session` を `/v1` 配下に揃える）
- `PATCH /v1/me`
- 認証系（必要なら）: `POST /v1/auth/callback`, `POST /v1/auth/refresh`, `POST /v1/auth/logout`

### 4.3 優先度C（カタログ/共有）
- Catalog:
  - `GET /v1/catalog/recipes`
  - `GET /v1/catalog/sets`
  - `GET /v1/catalog/recipes/{id}`
  - `GET /v1/catalog/sets/{id}`
  - `POST /v1/catalog/recipes/{id}/save`
  - `DELETE /v1/catalog/recipes/{id}/save`
  - `POST /v1/catalog/sets/{id}/save`
  - `DELETE /v1/catalog/sets/{id}/save`
  - `POST /v1/catalog/recipes/{id}/purchase`
  - `POST /v1/catalog/sets/{id}/purchase`
- Share:
  - `POST /v1/share`
  - `GET /v1/share/recipe/{id}`
  - `GET /v1/share/set/{id}`

### 4.4 優先度D（カテゴリ/アーカイブ）
- Category:
  - `GET /v1/categories`
  - `POST /v1/categories`
  - `PATCH /v1/categories/{id}`
  - `DELETE /v1/categories/{id}`
- Archive:
  - `GET /v1/archive`
  - `GET /v1/archive/{date}`

### 4.5 優先度E（決済読み取り系と通知）
- Payment/Subscription read系:
  - `GET /v1/payment-methods`
  - `DELETE /v1/payment-methods/{id}`
  - `POST /v1/purchases`
  - `GET /v1/purchases`
  - `GET /v1/subscriptions`
- Notification:
  - `GET /v1/notifications`
  - `POST /v1/notifications/read`
  - `POST /v1/push-tokens`
  - `DELETE /v1/push-tokens/{token}`
  - `GET /v1/notification-settings`
  - `PATCH /v1/notification-settings`

## 5. ブランチ戦略（dev起点）
- `feature/015-api-core-gap`:
  - `POST /v1/plan/advance`
  - `DELETE /v1/shopping-list/items/{id}`
  - `POST /v1/import/parse`
- `feature/016-api-auth-user`:
  - `GET /v1/auth/me`, `PATCH /v1/me`
  - （必要時）auth callback/refresh/logout
- `feature/017-api-catalog-share`:
  - Catalog + Share 一式
- `feature/018-api-category-archive`:
  - Category + Archive 一式
- `feature/019-api-payment-read-notification`:
  - Payment/Subscription read系 + Notification 一式

## 6. ループ運用ルール（実装時）
- 各ブランチで以下を最小単位で回す:
  1. ローカル実装（`apps/api/src/server.ts` + `apps/api/src/db/*`）
  2. ローカルテスト（ユニットまたは `npm run smoke:api --workspace=apps/api`）
  3. AWSデプロイ（dev環境）
  4. AWSスモーク（API Gateway経由で 2xx とDynamoDB反映確認）
- スモークが通るまで次ブランチへ進まない。
