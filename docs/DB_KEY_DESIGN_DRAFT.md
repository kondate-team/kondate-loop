# DynamoDBキー設計ドラフト（Issue #010: DB詳細実装）

更新日: 2026-02-09

## 1. 目的

- `kondate-loop-backend-stack` が作成する `MainTable`（PK/SK）に対して、API仕様に沿ったキー設計を定義する。
- まずは `apps/api` の `store.json` 依存を段階的に置き換えられる設計にする。
- 将来的な catalog/public データも同一テーブルで扱えるようにする（Single Table Design）。

## 2. 前提

- テーブル: `MainTable`（`PK` + `SK`、`PAY_PER_REQUEST`、SSE有効）
- 認証後APIは基本的に `userId` を持つ
- IDは ULID 前提（既存ドキュメント方針）
- 時系列ソートが必要なものは `createdAt` を含むキーにする

## 3. アクセスパターン（優先）

1. ユーザー情報の取得/更新
2. ユーザーのレシピ一覧取得（新着順）、詳細取得、作成、更新、削除
3. ユーザーのセット一覧取得（新着順）、詳細取得、作成、更新、削除
4. 献立 `current/next` の取得・更新
5. 買い物リスト一覧/追加/更新/完了
6. 冷蔵庫一覧/追加/更新/削除/復元
7. カテゴリ設定（book/catalog）一覧/追加/更新/削除
8. アーカイブ（月一覧、日別ログ）
9. 決済関連（支払い方法、購入履歴、サブスク状態）
10. catalog公開一覧（recipe/set）と詳細

## 4. PK/SK設計（ドラフト）

## 4.1 ユーザースコープデータ

- `PK = USER#{userId}`
- `SK` はエンティティ種別プレフィックスで分離

主なSK:

- `PROFILE#`
- `RECIPE#{recipeId}`
- `SET#{setId}`
- `PLAN#CURRENT`
- `PLAN#NEXT`
- `SHOPPING#{itemId}`
- `FRIDGE#{itemId}`
- `FRIDGE_DELETED#{deletedAt}#{itemId}`
- `CATEGORY#{scope}#{categoryId}` (`scope` = `book` or `catalog`)
- `PAYMENT_METHOD#{paymentMethodId}`
- `PURCHASE#{purchasedAt}#{purchaseId}`
- `SUBSCRIPTION#ACTIVE`
- `NOTIFICATION#{createdAt}#{notificationId}`
- `PUSH_TOKEN#{platform}#{tokenHash}`
- `NOTIFICATION_SETTINGS#`
- `COOKLOG#{date}#{logId}` (`date` = `YYYY-MM-DD`)
- `SAVED#RECIPE#{recipeId}`
- `SAVED#SET#{setId}`

## 4.2 catalog/publicデータ

- `PK = CATALOG#RECIPE`
  - `SK = CREATED#{createdAt}#{recipeId}`
- `PK = CATALOG#SET`
  - `SK = CREATED#{createdAt}#{setId}`

補助（作成者軸）:

- `PK = CREATOR#{creatorId}`
- `SK = CATALOG_RECIPE#{createdAt}#{recipeId}`
- `SK = CATALOG_SET#{createdAt}#{setId}`

## 4.3 共有リンク

- `PK = SHARE#{shareId}`
- `SK = META#`
- 属性に `targetType`, `targetId`, `authorName`, `sourceUrl` を保持

## 5. GSI案（ドラフト）

## GSI1: エンティティID逆引き

用途:
- `GET /v1/recipes/{id}`
- `GET /v1/sets/{id}`
- 共有リンク先の参照

キー:
- `GSI1PK = ENTITY#{entityType}#{id}` 例: `ENTITY#RECIPE#01H...`
- `GSI1SK = OWNER#{userId}` または `PUBLIC#`

## GSI2: catalog一覧（新着/人気）

用途:
- `GET /v1/catalog/recipes`
- `GET /v1/catalog/sets`

キー:
- `GSI2PK = CATALOG#{entityType}` (`RECIPE` / `SET`)
- `GSI2SK = SORT#{sortType}#{value}#{id}`
  - 例: `SORT#NEWEST#2026-02-09T10:00:00Z#01H...`
  - 例: `SORT#POPULAR#0000012345#01H...`（ゼロ埋め）

## GSI3: 作成者別catalog

用途:
- `creatorId` 絞り込みの一覧

キー:
- `GSI3PK = CREATOR#{creatorId}#{entityType}`
- `GSI3SK = CREATED#{createdAt}#{id}`

## 6. アイテム例

### レシピ

- `PK = USER#u_01`
- `SK = RECIPE#r_01`
- `GSI1PK = ENTITY#RECIPE#r_01`
- `GSI1SK = OWNER#u_01`
- 属性: `title`, `ingredients`, `steps`, `tags`, `origin`, `createdAt`, `updatedAt`, ...

### 献立 current

- `PK = USER#u_01`
- `SK = PLAN#CURRENT`
- 属性: `setId`, `setTitle`, `appliedAt`, `items[]`

### 月別アーカイブ用ログ

- `PK = USER#u_01`
- `SK = COOKLOG#2026-02-09#log_01`
- `begins_with(SK, "COOKLOG#2026-02")` で月一覧を取得

## 7. 実装ステップ（Issue #010）

1. キー命名定数を `apps/api` に追加（prefix管理）
2. `store.json` 読み書き箇所を repository 層へ抽象化
3. `User / Recipe / Set / Plan / Shopping / Fridge` から順に DynamoDB 実装へ移行
4. catalog用アイテムと GSI を追加
5. APIごとにクエリパターンをテスト（一覧、詳細、更新、削除）

## 8. 未確定事項

1. `savedCount` を即時集計するか、非同期集計にするか
2. 全文検索（`search`）をDynamoDB内でどこまで扱うか
3. `notification` の既読管理を別アイテム化するか
4. `shareId` を `targetId` 流用にするか、専用IDにするか

---

このドラフトは「実装着手用」の初版。Issue #010 では 1-7 の順で具体化する。

## 9. Implementation Status (2026-02-09)
- Added datastore key helpers and repository split (`file` / `dynamo`).
- Added GSI1/GSI2/GSI3 to dev/prod backend stack templates.
- Added smoke script: `apps/api/scripts/smoke-api.js`.
- Validation command: `npm run build --workspace=apps/api` then `npm run smoke:api --workspace=apps/api`.

## 10. GSI rollout note (2026-02-09)
- DynamoDB table update can create/delete only one GSI per stack update.
- Backend templates now support staged rollout by parameters:
  - `EnableGSI1` (default: `true`)
  - `EnableGSI2` (default: `false`)
  - `EnableGSI3` (default: `false`)
- GitHub Actions `deploy.yml` forwards repo variables:
  - Dev: `DDB_ENABLE_GSI1_DEV`, `DDB_ENABLE_GSI2_DEV`, `DDB_ENABLE_GSI3_DEV`
  - Prod: `DDB_ENABLE_GSI1_PROD`, `DDB_ENABLE_GSI2_PROD`, `DDB_ENABLE_GSI3_PROD`
- Rollout order: 1) GSI1 only -> 2) enable GSI2 -> 3) enable GSI3 (one change per deploy).

## 11. API runtime wiring (2026-02-09)
- Lambda environment now sets `DATA_STORE_DRIVER=dynamo` to force DynamoDB repository.
- Added `apps/api/src/lambda.ts` with `serverless-http` handler.
- Deploy workflow uploads built API artifact and passes:
  - `LambdaCodeS3Key=backend/<sha>/backend-lambda.zip`
  - `LambdaHandler=dist/lambda.handler`
- Post-deploy smoke now confirms API write path:
  - `POST /recipes` -> response `data.id`
  - DynamoDB `GetItem` by `PK=USER#...`, `SK=RECIPE#...`
