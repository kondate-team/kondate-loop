# FE追加改修リスト

> 作成日: 2026-01-28
> 更新日: 2026-01-28
> 目的: 仕様書との差分を洗い出し、FE追加改修箇所を明確化

---

## 実装状況サマリー

| # | 機能 | 実装状況 | 優先度 |
|---|------|---------|--------|
| 1 | 外部共有ページ（/share） | ❌ 未実装 | **高** |
| 2 | カタログ「保存解除」ボタン | ❌ 未実装 | **高** |
| 3 | Import「反映する」機能 | ❌ 未実装 | **高** |
| 4 | 通知ベースのオンボーディング | ❌ 未実装 | **高** |
| 5 | プロフィール編集 | ❌ 未実装 | 中 |
| 6 | PWAインストール促進 | ❌ 未実装 | 中 |
| 7 | プッシュ通知 | ❌ 未実装 | 中 |
| 8 | アーカイブ詳細モーダル | ⚠️ 部分実装 | 低 |
| 9 | カタログ未購入の表示制限 | ⚠️ 部分実装 | 低 |

---

## 1. 外部共有ページ（/share）❌ 未実装

### 現状
- ShareModal.tsx: 出典入力フォーム ✅
- ShareLinkModal.tsx: 共有URL表示・コピー ✅
- buildShareUrl(): URL生成 ✅

### 未実装
- `/share/recipe/{id}` ページ
- `/share/set/{id}` ページ
- 認証なしのゲスト閲覧ページ
- App.tsx の renderScreen() に share ルートなし

### 必要な作業
1. ShareRecipePage / ShareSetPage コンポーネント新規作成
2. ルーティング追加（認証不要）
3. `GET /share/recipe/{id}` API呼び出し
4. OGP対応（SNS共有時のプレビュー）
5. レシピ/セット表示UI（閲覧専用）

### 関連ファイル
- `/apps/web/src/App.tsx` L53-77（ScreenKey に追加）
- 新規: `ShareRecipePage.tsx`, `ShareSetPage.tsx`

---

## 2. カタログ「保存解除」ボタン ❌ 未実装

### 現状
- `saved={true}` の時、ボタンは disabled 状態
- 再度保存することしかできない
- 保存解除（DELETE API）の呼び出しコードなし

### 問題箇所
```tsx
// RecipeCatalogScreen.tsx L159-173
disabled={saved}  // ← 常に disabled で保存解除ができない
onClick={(event) => {
  event.stopPropagation()
  onSave?.()  // ← 常に保存処理のみ
}}
```

### 必要な作業
1. `saved={true}` の時に「保存解除」表示に切り替え
2. `onUnsave` ハンドラ追加
3. `DELETE /catalog/recipes/{id}/save` API呼び出し
4. `DELETE /catalog/sets/{id}/save` API呼び出し
5. isSaved フラグの状態更新

### 関連ファイル
- `/apps/web/src/screens/RecipeCatalogScreen.tsx` L159-173
- `/apps/web/src/App.tsx`（handleUnsaveRecipe/Set 追加）

---

## 3. Import「反映する」機能 ❌ 未実装

### 現状
- RecipeAddScreen: URLまたはテキスト入力フォーム ✅
- 「反映する」ボタン存在 ✅
- **ボタンに onClick ハンドラがない**

### 問題箇所
```tsx
// ExtraScreens.tsx L1033-1035
<Button variant="secondary" size="sm" className="rounded-full">
  反映する  {/* ← onClick ハンドラなし */}
</Button>
```

### 必要な作業
1. URL/テキスト入力値の取得
2. `POST /import/parse` API呼び出し
3. パース結果のプレビュー表示
4. 確認後にレシピ登録フォームへ反映
5. エラーハンドリング（パース失敗時）

### 関連ファイル
- `/apps/web/src/screens/ExtraScreens.tsx` L1027-1035

---

## 4. 通知ベースのオンボーディング ❌ 未実装

### 概要
初回ユーザーに「あなた宛て」通知を使ってモーダルガイドを表示する機能。
OnboardingScreen（使い方の1画面）とは別の仕組み。

### 現状
- OnboardingScreen（ExtraScreens.tsx L24-55）: 使い方説明の1画面 ✅ 存在
- **通知を使ったモーダルガイドシステム: ❌ なし**

### 仕様
1. 初回ユーザーに対して「あなた宛て」通知を自動生成
2. 通知クリックでモーダルを表示
3. モーダル内容（段階的に案内）:
   - 「まずはカテゴリを登録してみましょう」
   - 「レシピ一覧にやってみましょう」
   - 「献立を組んでみましょう」
   - 「PWAをホーム画面に追加しましょう」

### 必要な作業
1. オンボーディング用の通知テンプレート定義
2. 初回ログイン判定ロジック
3. 「あなた宛て」通知への自動追加
4. 通知クリック時のモーダル表示
5. 各モーダルのUI（カテゴリ登録促進、レシピ追加促進など）
6. モーダル完了後の通知既読処理

### 関連ファイル
- `/apps/web/src/screens/ExtraScreens.tsx` L1486-1685（NotificationsScreen）
- 新規: `OnboardingGuideModal.tsx`（モーダルコンポーネント）

---

## 5. プロフィール編集 ❌ 未実装

### 現状
- 「プロフィール編集」ボタン存在（クリエイターのみ表示）
- **onClick ハンドラがない**

### 問題箇所
```tsx
// MyPageScreen.tsx L127-133
<Button variant="ghost" size="sm">
  プロフィール編集  {/* ← onClick ハンドラなし */}
</Button>
```

### 必要な作業
1. ProfileEditModal コンポーネント新規作成
2. 名前変更フォーム
3. アバター選択/アップロード機能
4. `PATCH /me` API呼び出し
5. 成功時のトースト表示
6. モーダル開閉ロジック

### 関連ファイル
- `/apps/web/src/screens/MyPageScreen.tsx` L127-133
- 新規: `ProfileEditModal.tsx`

---

## 6. PWAインストール促進 ❌ 未実装

### 現状
- PWA インストール促進のUI なし
- 「ホーム画面に追加」案内なし
- beforeinstallprompt イベント処理なし

### 必要な作業
1. beforeinstallprompt イベントの処理
2. インストール促進バナー/モーダル
3. 「ホーム画面に追加」ガイド
4. インストール完了後の非表示処理

### 参考
- 仕様: 通知の「あなた宛て」でPWAホーム追加促し

---

## 7. プッシュ通知 ❌ 未実装

### 現状
- NotificationsScreen: 通知一覧表示 ✅
- news / personal タブ ✅
- 既読/未読管理 ✅

### 未実装
- プッシュ通知の実装
- Service Worker 登録
- デバイストークン登録
- `POST /push-tokens` API呼び出し

### 必要な作業
1. Service Worker セットアップ
2. プッシュ通知許可リクエストUI
3. FCM/Web Push 統合
4. デバイストークン登録API呼び出し

### 関連ファイル
- `/apps/web/src/screens/ExtraScreens.tsx` L1486-1685

---

## 8. アーカイブ詳細モーダル ⚠️ 部分実装

### 現状
- ArchiveScreen: 日付リスト表示 ✅
- カレンダーUI（日付グリッド）なし
- 日付クリック時のストーリー形式モーダルなし

### 必要な作業
1. カレンダーグリッドUI実装
2. 料理ログがある日のマーカー表示
3. 日付クリック時のモーダル
4. ストーリー形式（スワイプ切り替え）

### 関連ファイル
- `/apps/web/src/screens/ExtraScreens.tsx` L2014-2035

---

## 9. カタログ未購入の表示制限 ⚠️ 部分実装

### 現状
- recipeLocked フラグで判定あり
- モーダルで lockedMessage テキスト表示あり

### 未実装
- 未購入レシピの材料/手順を実際に非表示にする
- 「購入すると見れます」のブラーUI

### 関連ファイル
- `/apps/web/src/App.tsx` L670-677

---

## 実装済み機能（確認済み）

| 機能 | 状態 | 備考 |
|------|------|------|
| 使い方画面（OnboardingScreen） | ✅ 完了 | ExtraScreens.tsx L24-55 ※通知ベースのオンボーディングは別 |
| 出典制約 | ✅ 完了 | ShareModal.tsx |
| 献立昇格（Plan Advance） | ✅ 完了 | App.tsx L962-973 |
| カテゴリ管理 | ✅ 完了 | CategoryManagerModal.tsx |
| 通知一覧・既読管理 | ✅ 完了 | ExtraScreens.tsx L1486-1685 |

---

## 優先度別まとめ

### 高（API接続前に必要）
1. **外部共有ページ** - 共有機能の最終ピース
2. **カタログ保存解除** - 基本機能
3. **Import反映機能** - レシピ取り込みの核
4. **通知ベースのオンボーディング** - 初回ユーザーのガイド

### 中（API接続と並行可）
5. プロフィール編集
6. PWAインストール促進
7. プッシュ通知

### 低（後回し可）
8. アーカイブ詳細モーダル
9. カタログ未購入の表示制限

---

## 備考

- 上記はすべてモックデータで動作している状態
- API接続時にエンドポイント呼び出しの実装が追加で必要
- エラーハンドリング、ローディング状態の追加も必要
