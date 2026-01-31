# Stripe決済 実装ステータス

> 最終更新: 2026-01-30
> 担当: Itsuki

---

## 1. ゴール

**ユーザーがクレジットカードで「ユーザー+」プラン（月額¥500）に課金できる状態**

```
ユーザー → カード入力 → 支払い方法登録 → サブスク開始 → 毎月自動課金
```

---

## 2. 全体像（何が必要か）

```
┌─────────────────────────────────────────────────────────────────┐
│                        Stripeアカウント                          │
│  ・Products/Prices設定（ダッシュボード）                          │
│  ・APIキー取得（テスト用 / 本番用）                               │
│  ・Webhook設定（支払い成功/失敗の通知受信）                        │
└─────────────────────────────────────────────────────────────────┘
                              │
        ┌─────────────────────┴─────────────────────┐
        ▼                                           ▼
┌───────────────────┐                     ┌───────────────────┐
│   フロントエンド    │                     │   バックエンド     │
│                   │                     │                   │
│ ・Stripe.js導入   │ ─── paymentMethodId ──▶│ ・Customer作成    │
│ ・カード入力UI    │                     │ ・PaymentMethod紐付│
│ ・PaymentMethod  │ ◀── 成功/エラー ────│ ・Subscription作成 │
│   作成           │                     │ ・Webhook受信      │
└───────────────────┘                     └───────────────────┘
        │                                           │
        └─────────────────────┬─────────────────────┘
                              ▼
                    ┌───────────────────┐
                    │    DynamoDB       │
                    │ ・User（顧客ID）   │
                    │ ・Subscription    │
                    │ ・Purchase        │
                    └───────────────────┘
```

---

## 3. 現在の実装状況

### フロントエンド ✅ 完了

| 項目 | ファイル | 状況 |
|-----|---------|------|
| Stripe.js導入 | `package.json` | ✅ `@stripe/stripe-js`, `@stripe/react-stripe-js` |
| Stripe初期化 | `src/lib/stripe.ts` | ✅ 環境変数から公開鍵読み込み |
| カード入力コンポーネント | `src/components/StripeCardInput.tsx` | ✅ CardElement使用 |
| MyPageへの統合 | `src/screens/MyPageScreen.tsx` | ✅ PR #51 |
| paymentMethodId取得 | - | ✅ `stripe.createPaymentMethod()` |

**フロントエンドは完成。カード入力 → PaymentMethod作成まで動作する。**

### バックエンド ❌ 未実装

| 項目 | エンドポイント | 状況 |
|-----|---------------|------|
| 支払い方法登録 | `POST /v1/payment-methods` | ❌ |
| サブスク開始 | `POST /v1/subscriptions` | ❌ |
| サブスク解約 | `DELETE /v1/subscriptions` | ❌ |
| Webhook受信 | `POST /webhooks/stripe` | ❌ |
| 単発購入 | `POST /v1/purchases` | ❌（後回しでOK）|

### Stripeアカウント ⚠️ 要確認

| 項目 | 状況 |
|-----|------|
| アカウント作成 | ❓ 未確認 |
| テストAPIキー取得 | ❓ 未確認 |
| Products/Prices設定 | ❓ 未確認 |
| Webhook設定 | ❌ BE実装後 |

### 環境変数

```env
# apps/web/.env（フロントエンド）
VITE_STRIPE_PUBLISHABLE_KEY=  # ← 空（テストキー設定待ち）

# バックエンド（Lambda用）※未作成
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
STRIPE_PRICE_USER_PLUS_MONTHLY=
```

---

## 4. 次にやること（優先順）

### Step 1: Stripeアカウント準備 🎯 今ここ

```
1. https://dashboard.stripe.com でアカウント作成（無料）
2. テストAPIキー取得
   - 公開鍵: pk_test_xxx → apps/web/.env
   - 秘密鍵: sk_test_xxx → バックエンド用に控えておく
3. Products作成（ダッシュボード > Products）
   - 名前: ユーザー+
   - 価格: ¥500/月（recurring）
   - Price ID (price_xxx) を控える
```

**所要時間: 10分**

### Step 2: フロントエンド動作確認

```
1. .env に VITE_STRIPE_PUBLISHABLE_KEY=pk_test_xxx 設定
2. npm run dev
3. マイページ > お支払い情報 でカード入力UI表示確認
4. テストカード 4242 4242 4242 4242 で入力
5. コンソールでpaymentMethodId (pm_xxx) が取得できればOK
```

### Step 3: バックエンド実装

```
POST /v1/payment-methods
  - paymentMethodIdを受け取る
  - Stripe Customer作成（初回のみ）
  - PaymentMethod を Customer に紐付け
  - DynamoDB User に stripeCustomerId 保存

POST /v1/subscriptions
  - planId, paymentMethodIdを受け取る
  - stripe.subscriptions.create()
  - User.role を user_plus に更新
```

### Step 4: Webhook設定

```
1. Stripeダッシュボード > Webhooks > Add endpoint
2. URL: https://api.xxx.com/webhooks/stripe
3. イベント選択:
   - customer.subscription.deleted
   - invoice.payment_failed
4. 署名シークレット(whsec_xxx)を環境変数に設定
```

---

## 5. テスト用カード番号

| カード番号 | 挙動 |
|-----------|------|
| `4242 4242 4242 4242` | 成功 |
| `4000 0000 0000 0002` | 拒否 |
| `4000 0000 0000 9995` | 残高不足 |

有効期限: 未来の日付（例: 12/30）
CVC: 任意の3桁

---

## 6. 参照ドキュメント

- [外部連携詳細仕様書](../../../knowledge/side-business/kondate-loop/02_仕様/外部連携詳細仕様書.md) - 2章
- [API仕様定義書](../../../knowledge/side-business/kondate-loop/02_仕様/API仕様定義書_埋め込み済み.md)
- [Stripe公式ドキュメント](https://stripe.com/docs)

---

## 7. 関連Issue/PR

| # | タイトル | 状況 |
|---|---------|------|
| #47 | Stripe連携の基盤実装 | ✅ Merged |
| #50 | MyPageScreenにStripeCardInput統合 | 🔄 PR #51 |
| - | バックエンド決済API | ❌ 未作成 |

---

## まとめ

```
✅ 完了: フロントエンド（カード入力UI、PaymentMethod作成）
⏳ 次: Stripeアカウント準備 → APIキー設定 → 動作確認
❌ 残り: バックエンドAPI（Lambda）、Webhook
```

**決済が動くまでの最短ルート:**
1. Stripeアカウント作る（10分）
2. テストキー設定して動作確認（5分）
3. BE API実装（これがメイン作業）
