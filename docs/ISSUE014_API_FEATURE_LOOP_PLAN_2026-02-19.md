# Issue #014 API機能ループ実装計画（2026-02-19）

## 1. 目的
- API設計との差分を段階的に解消し、ローカル実装からAWS検証までを一貫して完了させる。
- 実装単位を小さく分け、各ブランチでスモーク確認が通るまで次に進まない運用を徹底する。

## 2. 対象範囲
- 主実装: `apps/api/src/server.ts`
- 永続化層: `apps/api/src/db/fileStore.ts`, `apps/api/src/db/dynamoStore.ts`, `apps/api/src/db/types.ts`
- 共有型: `packages/types/src/api/endpoints.ts`
- フロント接続: `apps/web/src/services/auth.ts`

## 3. ブランチ分割方針
- `feature/015-api-core-gap`
  - `POST /v1/plan/advance`
  - `DELETE /v1/shopping-list/items/{id}`
  - `POST /v1/import/parse`
- `feature/016-api-auth-user`
  - `GET /v1/auth/me`
  - `PATCH /v1/me`
  - 認証系の不足分（callback/refresh/logout）は後続で継続実装
- `feature/017-api-catalog-share`
  - Catalog / Share 系エンドポイント一式
- `feature/018-api-category-archive`
  - Category / Archive 系エンドポイント一式
- `feature/019-api-payment-read-notification`
  - Payment/Subscription 読み取り系、Notification 系
  - 追加対応: 認証不足分 (`/v1/auth/callback`, `/v1/auth/refresh`, `/v1/auth/logout`)

## 4. 実行手順（最小単位）
各ブランチで以下を順番に実施する。

1. ローカル実装
   - `apps/api/src/server.ts` と `apps/api/src/db/*` を更新
2. ローカル検証
   - `npm run build --workspace=apps/api`
   - `npm run smoke:api --workspace=apps/api`
3. AWSデプロイ（dev）
   - GitHub Actions `Deploy`（featureブランチ push）
4. AWSスモーク
   - API Gateway経由の2xx確認
   - DynamoDBへの反映確認（ワークフロー内スモーク）

## 5. 進捗記録

### 5-1. `feature/015-api-core-gap`
- 実装済み:
  - `POST /v1/plan/advance`
  - `DELETE /v1/shopping-list/items/{id}`
  - `POST /v1/import/parse`
- ローカル検証:
  - `npm run smoke:api --workspace=apps/api` 成功
- AWS検証:
  - `Deploy` 成功（Run: `22178155338`）

### 5-2. `feature/016-api-auth-user`
- 実装済み:
  - `GET /v1/auth/me`
  - `PATCH /v1/me`
- データストア対応:
  - `name`, `role`, `avatarUrl`, `createdAt`, `updatedAt` を file/dynamo 双方で扱うよう更新
- ローカル検証:
  - ブランチ作業時点でローカル確認済み
- AWS検証:
  - `Deploy` 成功（Run: `22186064652`）
  - 同一SHAで `Deploy dev to GitHub Pages` も成功（Run: `22186064613`）

### 5-3. `feature/017-api-catalog-share`
- 実装済み:
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
  - `POST /v1/share`
  - `GET /v1/share/recipe/{id}`
  - `GET /v1/share/set/{id}`
- ローカル検証:
  - ブランチ作業時点でローカル確認済み
- AWS検証:
  - `Deploy` 成功（Run: `22179166316`）

### 5-4. `feature/018-api-category-archive`
- 実装済み:
  - `GET /v1/categories`
  - `POST /v1/categories`
  - `PATCH /v1/categories/{id}`
  - `DELETE /v1/categories/{id}`
  - `GET /v1/archive`
  - `GET /v1/archive/{date}`
- 追加対応:
  - `PATCH /v1/plan/items/{id}` で `isCooked=true` のとき調理ログ保存
- ローカル検証:
  - `npm run smoke:api --workspace=apps/api` 成功
- AWS検証:
  - `Deploy` 成功（Run: `22182400590`）

### 5-5. `feature/019-api-payment-read-notification`
- 実装済み（既存）:
  - `GET /v1/payment-methods`
  - `DELETE /v1/payment-methods/{id}`
  - `POST /v1/purchases`
  - `GET /v1/purchases`
  - `GET /v1/subscriptions`
  - `GET /v1/notifications`
  - `POST /v1/notifications/read`
  - `POST /v1/push-tokens`
  - `DELETE /v1/push-tokens/{token}`
  - `GET /v1/notification-settings`
  - `PATCH /v1/notification-settings`
- 実装済み（2026-02-20 追加）:
  - `POST /v1/auth/callback`
  - `POST /v1/auth/refresh`
  - `POST /v1/auth/logout`
  - 互換用: `POST /auth/callback`, `POST /auth/refresh`, `POST /auth/logout`
- フロント/型更新（2026-02-20）:
  - `apps/web/src/services/auth.ts` を `/v1/auth/*` に接続
  - `packages/types/src/api/endpoints.ts` に auth callback/refresh/logout の型を追加
- ローカル検証:
  - `npm run build --workspace=apps/api` 成功
  - `npm run smoke:api --workspace=apps/api` 成功
  - `npm run build --workspace=packages/types` 成功
  - `npm run build --workspace=apps/web` 成功
- 備考:
  - `apps/web` ビルド失敗の原因だった optional 依存不足を解消
  - `@rollup/rollup-win32-x64-msvc` を `apps/web` の optionalDependencies に追加
- AWS検証:
  - `Deploy` 成功（Run: `22214691416`）

## 6. 現時点の判定（15〜19）
- 5ブランチすべてで、最新リモートSHAに対する `Deploy` 成功を確認済み。
- ブランチ単位の実装・検証サイクルは、運用方針どおり完了状態。

## 7. 次アクション
- 必要に応じて `dev` への取り込み順（15→16→17→18→19）を最終確認する。
- 取り込み時は各PRで `Deploy` の再実行結果を確認し、回帰がないことを担保する。
