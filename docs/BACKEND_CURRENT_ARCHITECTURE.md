# バックエンド現状構成とフロント接続メモ（2026-02-09）

## 1. 現在のバックエンドは2系統

### A. AWSデプロイ系（CloudFormation）
- テンプレート: `infra/aws-resources/kondate-loop-backend-stack.yaml`
- 構成: API Gateway（REST）+ Lambda 1本 + DynamoDB 1テーブル
- ルーティング: `/v1` と `/v1/{proxy+}` の両方を Lambda プロキシに集約
- 認証: `AuthorizationType: NONE`（JWT Authorizer 未実装）
- 重要: `LambdaCodeS3Key` が空だと、Lambda はインラインの placeholder コードで動作

### B. ローカルAPI系（Node/Express）
- 実装: `apps/api/src/server.ts`
- 起動: `npm run dev:api`
- 主な範囲: Stripe の決済・サブスク・Connect 系エンドポイント
- 保存先: `apps/api/data/store.json`（暫定のローカルJSONストア）

## 2. 今の実デプロイ状態

- CIワークフロー: `.github/workflows/deploy.yml`
- `feature/**` への push では `kondate-loop-backend-stack.yaml` のみデプロイ
- 現状ワークフローは `LambdaCodeS3Key` を渡していない
- 結果として、AWSのLambda実体は placeholder の可能性が高い

## 3. フロントエンド側の現状

- APIベースURLの参照元: `apps/web/src/api/config.ts`（`VITE_API_BASE_URL`）
- デフォルトのモック設定: `apps/web/.env.example` は `VITE_API_USE_MOCK=true`
- `auth/recipes/sets` はモック対応済み:
  - `apps/web/src/services/auth.ts`
  - `apps/web/src/services/recipes.ts`
  - `apps/web/src/services/sets.ts`
- 決済系APIは実エンドポイント呼び出し:
  - `apps/web/src/api/payment.ts`

## 4. 接続済みと未接続

### いま接続しやすい範囲
- Payment / Subscription / Connect:
  - `POST /v1/payment-methods`
  - `POST /v1/subscriptions`
  - `DELETE /v1/subscriptions`
  - `POST /v1/purchases/plan`
  - `POST /v1/connect/accounts`
  - `POST /v1/connect/account-links`
  - `GET /v1/connect/accounts/:userId`
  - `POST /v1/connect/login-links`
  - `POST /v1/purchases/content`

### まだ未接続の範囲
- FEが期待する献立/レシピ/カタログ/Auth本体API
- バックエンド側のJWT検証ベース認証
- ローカルExpress APIのDynamoDB本番向け実装

## 5. フロントとつなぐために必要なもの

### 5.1 最短でローカル接続する手順

1. `apps/api/.env` を作成して以下を設定
   - `STRIPE_SECRET_KEY`
   - `STRIPE_WEBHOOK_SECRET`（Webhook試験時）
   - `STRIPE_PRICE_ID_USER_PLUS`
   - `STRIPE_PRICE_ID_CREATOR_PLUS`
   - `STRIPE_PRICE_ID_CREATOR`
   - `CORS_ORIGIN=http://localhost:5173`
2. API起動: `npm run dev:api`
3. Web側の環境変数を設定
   - `VITE_API_BASE_URL=http://localhost:4242`
   - `VITE_API_USE_MOCK=true`（未実装領域で画面を止めないため）
   - `VITE_FEATURE_MYPAGE=true`（決済UIを試す場合）
4. Web起動: `npm run dev`

### 5.2 AWS本番連携で追加実装が必要な項目

1. Lambda成果物デプロイ経路
   - APIランタイムコードを build/zip
   - S3へアップロード
   - CIの `cloudformation deploy` に `LambdaCodeS3Key`（必要なら version）を渡す
2. API契約の統一
   - FEが呼ぶパスとBE実装済みパスを整合
   - `/v1` を base URL 側で持つか、各リクエスト側で持つかを統一
3. 認証統合
   - BEに Cognito/JWT 検証を実装
   - FE APIクライアントに `Authorization: Bearer` 付与を実装
4. CORS整備
   - 本番Originを許可
   - OPTIONS/プリフライトを明示対応
5. データ層移行
   - `store.json` を廃止し、DynamoDB永続化へ統一

## 6. ハマりやすいポイント

- CloudFormation出力 `BackendApiEndpoint` は `.../{env}/v1` まで含む
- FEの決済クライアントは `"/v1/..."` をさらに付与する
- そのまま合わせると `"/v1/v1/..."` になりやすい
- `VITE_API_USE_MOCK=false` だと未実装エンドポイントで即失敗する
- 「デプロイ済み」でも、成果物連携がないと placeholder Lambda のまま
