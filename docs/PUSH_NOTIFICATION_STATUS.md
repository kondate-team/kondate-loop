# プッシュ通知 実装ステータス

> 最終更新: 2026-02-01
> 担当: Itsuki

---

## 1. 現在の状況サマリー

```
✅ フロントエンド: 完了（FCMトークン取得、受信準備）
❌ バックエンド: 未実装（AWS基盤待ち）
❌ Firebase設定: 未設定（プロジェクト作成待ち）
```

---

## 2. 実装済み（フロントエンド）

| ファイル | 内容 | 状況 |
|---------|------|------|
| `lib/firebase.ts` | Firebase SDK初期化 | ✅ |
| `lib/push.ts` | トークン取得・保存ユーティリティ | ✅ |
| `public/firebase-messaging-sw.js` | バックグラウンド通知受信 | ✅ |
| `MyPageScreen.tsx` | ON/OFFトグルUI | ✅ |

### 現状の動作

- Firebase未設定時: フォールバックトークン（`fallback-xxx`）で動作
- Firebase設定後: 本物のFCMトークンを取得
- トークンはlocalStorageに保存（サーバー送信は未実装）

---

## 3. 未実装（AWS基盤構築後に必要）

| 項目 | 説明 |
|------|------|
| **Firebaseプロジェクト作成** | Firebase Consoleでプロジェクト作成 |
| **環境変数設定** | `.env`にFirebase設定値を入れる |
| **Service Worker更新** | `firebase-messaging-sw.js`のプレースホルダーを実際の値に置換 |
| **トークン保存API** | `POST /v1/users/:userId/push-token` |
| **通知送信機能** | Firebase Admin SDK + Lambda |

---

## 4. 関連PR

| # | タイトル | 状況 |
|---|---------|------|
| #52 | FCMプッシュ通知の基盤実装 | ✅ Merged (PR #53) |

---

## 5. 次のステップ

### Firebaseプロジェクト設定

```
1. Firebase Console (https://console.firebase.google.com)
2. プロジェクト作成
3. Cloud Messaging有効化
4. ウェブアプリ追加 → 設定値取得
5. Cloud Messaging > ウェブプッシュ証明書 > VAPIDキー取得
```

### 環境変数（取得後に設定）

```env
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
VITE_FIREBASE_VAPID_KEY=
```

### バックエンドAPI（AWS構築後）

```
POST /v1/users/:userId/push-token
  - FCMトークンを受け取りDynamoDBに保存

Lambda (通知送信)
  - Firebase Admin SDKで通知送信
  - トリガー: EventBridge / SQS など
```

---

## 6. 参照ドキュメント

- [外部連携詳細仕様書](../../../knowledge/side-business/kondate-loop/02_仕様/外部連携詳細仕様書.md) - 3章
- [Firebase Cloud Messaging](https://firebase.google.com/docs/cloud-messaging)
