# Stripe決済 実装ステータス

> 最終更新: 2026-02-01
> 担当: Itsuki

---

## 1. 現在の状況サマリー

```
✅ フロントエンド: 完了（カード入力、購入フロー、カード状態共有）
✅ バックエンド: 完了（Express一時サーバー、Stripe API連携）
✅ Stripeアカウント: 設定済み（テストモード）
⏳ AWS移行: 未着手（Cognito/Lambda/DynamoDB）
```

---

## 2. 実装済み機能

### プラン課金

| プラン | 種別 | 価格 | 状況 |
|-------|------|------|------|
| ユーザー+ | サブスク | ¥500/月 | ✅ 動作確認済み |
| クリエイター+ | サブスク | ¥800/月 | ✅ 動作確認済み |
| クリエイター | 買い切り | ¥1,200 | ✅ 動作確認済み |

### コンテンツ購入（有料レシピ/セット）

| 項目 | 状況 |
|------|------|
| 購入フロー | ✅ Platform Receipt方式で実装 |
| 価格範囲 | ¥100〜¥10,000 |
| プラットフォーム手数料 | 10% |
| クリエイターへの支払い | 後から銀行振込（Connect不要）|

### カード管理

| 機能 | 状況 |
|------|------|
| カード登録 | ✅ StripeCardInputコンポーネント |
| 購入時のカード登録 | ✅ 購入フロー内で登録可能 |
| カード状態共有 | ✅ App.tsx ↔ MyPageScreen間で同期 |
| 登録済みカードで支払い | ✅ 「このカードで支払う」UI |
| 別のカードを使う | ✅ 切り替えオプション |

---

## 3. 技術仕様

### コンテンツ購入の決済方式

**採用: Platform Receipt（全額プラットフォーム受取）**

```
ユーザー → Stripe → こんだてLoop（全額受取）
                         ↓
              後日、銀行振込でクリエイターへ支払い
```

- クリエイターのStripe Connectアカウント不要
- 日本の一般的なWebサービスと同じ方式
- メタデータにプラットフォーム手数料・クリエイター取り分を記録

**不採用: Destination Charge**
- クリエイターごとにConnect Accountが必要
- 審査・本人確認が必要で導入ハードルが高い

### API エンドポイント（Express一時サーバー）

| エンドポイント | 用途 |
|---------------|------|
| `POST /v1/payment-methods` | カード登録 |
| `POST /v1/subscriptions` | サブスク開始 |
| `DELETE /v1/subscriptions/:id` | サブスク解約 |
| `POST /v1/purchases/plan` | プラン買い切り購入 |
| `POST /v1/purchases/content` | コンテンツ購入 |
| `POST /webhooks/stripe` | Webhook受信 |

---

## 4. 関連PR/Issue

| # | タイトル | 状況 |
|---|---------|------|
| #47 | Stripe連携の基盤実装 | ✅ Merged |
| #49 | Stripe Elements統合 | ✅ Merged |
| #51 | MyPageにStripe統合 | ✅ Closed（#59で実装済み）|
| #54 | Stripe決済API実装 | ✅ Merged |
| #56-58 | Stripe決済フル実装 | ✅ Merged |
| #59 | コンテンツ購入UX改善 | ✅ Merged |

---

## 5. 次のステップ（AWS移行時）

### 必要な作業

1. **Cognito認証統合**
   - 現在のハードコード userId を Cognito ユーザーIDに置換
   - JWTトークン検証

2. **DynamoDB設計**
   - Users テーブル: stripeCustomerId, stripeDefaultPaymentMethodId
   - Subscriptions テーブル: stripeSubscriptionId, status
   - Purchases テーブル: 購入履歴

3. **Lambda移行**
   - Express → API Gateway + Lambda
   - 環境変数でStripeキー管理

4. **Webhook設定**
   - API Gateway エンドポイント作成
   - Stripe Dashboard で本番URL設定

---

## 6. テスト情報

### テストカード

| カード番号 | 挙動 |
|-----------|------|
| `4242 4242 4242 4242` | 成功 |
| `4000 0000 0000 0002` | 拒否 |
| `4000 0000 0000 9995` | 残高不足 |

有効期限: 未来の日付（例: 12/30）
CVC: 任意の3桁

### ローカル開発

```bash
# APIサーバー起動
cd apps/api && npm run dev  # localhost:4242

# Webアプリ起動
cd apps/web && npm run dev  # localhost:5173

# Stripe CLI（Webhook転送）
stripe listen --forward-to localhost:4242/webhooks/stripe
```

---

## 7. 参照ドキュメント

- [外部連携詳細仕様書](../../../knowledge/side-business/kondate-loop/02_仕様/外部連携詳細仕様書.md) - 2章
- [API仕様定義書](../../../knowledge/side-business/kondate-loop/02_仕様/API仕様定義書_埋め込み済み.md)
- [Stripe公式ドキュメント](https://stripe.com/docs)
