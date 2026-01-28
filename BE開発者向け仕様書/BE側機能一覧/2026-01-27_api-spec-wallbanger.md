# Kondate Loop API仕様書作成 壁打ちメモ

> 作成日: 2026-01-27
> 目的: 契約凍結シートの「API/BE未接続」チェックリストを埋め、API仕様書を完成させる

---

## 現状サマリー

### 完了済み（UIモック）
- 献立表/セット選択/冷蔵庫/買い物リストのUI
- レシピ帳（レシピ/セット、カテゴリ、検索/絞り込み/並び替え）
- レシピカタログ（購入/保存導線、料理家ページ遷移）
- マイページ（プラン変更/決済確認/購入履歴/ログアウト）
- 認証（入口/ログイン/新規登録/エラー）
- トースト/モーダル動作

### API/BE未接続（今回埋めるべき項目）
1. [ ] API接続（現状モック）
2. [ ] 購入/決済の実処理
3. [ ] 料理ログ/アーカイブ（データ連携）
4. [ ] 診断生成
5. [ ] メンバーシップ加入/決済
6. [ ] フォロー/掲示板/外部共有
7. [ ] **ID方式/エラー形式/人気指標の最終確定** ← 最初にここを決める

---

## 壁打ちログ

### 1. ID方式の確定

**選択肢:**
- UUID v4 - 衝突確率が低い、フロントで生成可能
- ULID - ソート可能、時刻情報を含む
- Snowflake - Twitter/Discord方式、高速生成
- Auto Increment - シンプル、DB依存

**現状のUI型定義（src/types/api.ts）:**
- `id: string` で統一されている

**決定事項:**
- **ULID を採用**
- 理由: DynamoDBのSort Keyで時系列ソートが自然にできる、URLが短い
- セキュリティ: 認証/認可をしっかり実装すれば問題なし（ID方式で守ろうとしない）
- Node.jsライブラリ: `ulid` パッケージを使用

---

### 2. エラー形式の確定

**契約凍結シートの定義:**
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "入力内容に誤りがあります",
    "details": [...]
  }
}
```

**ステータスコード方針:**
- 400: Bad Request（バリデーションエラー）
- 401: Unauthorized（認証エラー）
- 403: Forbidden（権限エラー）
- 404: Not Found
- 409: Conflict（重複など）
- 422: Unprocessable Entity
- 500: Internal Server Error

**決定事項:**
- HTTPステータス: **400=形式エラー、422=バリデーションエラー**（REST的に正しい方式）
- エラーコード命名: **スネークケース大文字**（例: `VALIDATION_ERROR`）
- details形式:
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "入力内容に誤りがあります",
    "details": [
      { "field": "title", "message": "タイトルは必須です" }
    ]
  }
}
```

**主要エラーコード一覧:**
| コード | HTTPステータス | 用途 |
|--------|---------------|------|
| INVALID_REQUEST | 400 | JSONパースエラー等 |
| UNAUTHORIZED | 401 | 認証エラー |
| FORBIDDEN | 403 | 権限エラー |
| NOT_FOUND | 404 | リソースなし |
| CONFLICT | 409 | 重複登録 |
| VALIDATION_ERROR | 422 | バリデーションエラー |
| INTERNAL_ERROR | 500 | サーバーエラー |

---

### 3. 人気指標の確定

**選択肢:**
- 保存数（savedCount）
- 購入数
- 閲覧数
- 複合指標

**現状のモックデータ:**
- `savedCount` フィールドが存在

**決定事項:**
- **MVP: 保存数（savedCount）のみで人気順ソート**
- 将来的には閲覧数（viewCount）も取得したい → APIアクセス時のカウントアップ実装を後で追加
- 絞り込み条件としての保存数活用は将来検討

---

## 4. APIエンドポイント詳細定義

### 4-1. Plan（献立）API

**データ構造:**
- 1ユーザーにつき「current（現在）」と「next（次）」の2枠
- セット適用時は置換

**PlanItem:**
```json
{
  "id": "01HNK...",
  "recipeId": "01HNJ...",
  "title": "甘辛チキンと焼き野菜",
  "thumbnailUrl": "https://...",
  "isCooked": false,
  "cookedAt": null
}
```

---

#### GET /plan
現在の献立を取得

**Response:**
```json
{
  "data": {
    "current": {
      "setId": "01HNJ...",
      "setTitle": "平日5日ゆるっとセット",
      "appliedAt": "2026-01-20T09:00:00Z",
      "items": [
        {
          "id": "01HNK...",
          "recipeId": "01HNJ...",
          "title": "甘辛チキンと焼き野菜",
          "thumbnailUrl": "https://...",
          "isCooked": true,
          "cookedAt": "2026-01-21T19:30:00Z"
        }
      ]
    },
    "next": null
  }
}
```

---

#### POST /plan/select-set
セットを献立に適用

**Request:**
```json
{
  "setId": "01HNJ...",
  "slot": "current" | "next"
}
```

**Response:**
```json
{
  "data": {
    "slot": "current",
    "setId": "01HNJ...",
    "setTitle": "平日5日ゆるっとセット",
    "appliedAt": "2026-01-27T10:00:00Z",
    "items": [...]
  }
}
```

---

#### PATCH /plan/items/{id}
「作った」トグル

**Request:**
```json
{ "isCooked": true }
```

**Response:**
```json
{
  "data": {
    "id": "01HNK...",
    "isCooked": true,
    "cookedAt": "2026-01-27T19:30:00Z"
  }
}
```

※ `isCooked: false` で取り消し可能

---

### 4-2. Shopping（買い物リスト）API

**設計方針:**
- 買い物リストは献立に従属（献立変更で自動再生成）
- セット適用時に自動生成（冷蔵庫の在庫を差し引き）
- 同じ食材は合算（同一名称 + 同一単位のみ）
- 単位が違う場合は別々に表示（単位変換はしない）
- 買い物完了 → チェック済みは冷蔵庫へ、未チェックは残る

**合算ロジック例:**
```
レシピA: 卵 2個
レシピB: 卵 3個
冷蔵庫: 卵 1個
→ 買い物リスト: 卵 4個（5-1）
```

**ShoppingItem:**
```json
{
  "id": "01HNK...",
  "name": "鶏もも肉",
  "quantity": 2,
  "unit": "枚",
  "checked": false,
  "source": "auto" | "manual"
}
```

---

#### GET /shopping-list
買い物リスト取得

**Response:**
```json
{
  "data": {
    "items": [
      {
        "id": "01HNK...",
        "name": "鶏もも肉",
        "quantity": 2,
        "unit": "枚",
        "checked": false,
        "source": "auto"
      }
    ]
  }
}
```

---

#### POST /shopping-list/items
手動追加

**Request:**
```json
{
  "name": "牛乳",
  "quantity": 1,
  "unit": "本"
}
```

**Response:**
```json
{
  "data": {
    "id": "01HNL...",
    "name": "牛乳",
    "quantity": 1,
    "unit": "本",
    "checked": false,
    "source": "manual"
  }
}
```

---

#### PATCH /shopping-list/items/{id}
チェック ON/OFF

**Request:**
```json
{ "checked": true }
```

**Response:**
```json
{
  "data": {
    "id": "01HNK...",
    "checked": true
  }
}
```

---

#### POST /shopping-list/complete
買い物完了（チェック済みを冷蔵庫へ移動）

**Response:**
```json
{
  "data": {
    "movedToFridge": 5,
    "remaining": 2
  }
}
```

---

### 4-3. Fridge（冷蔵庫）API

**設計方針:**
- 「作った」を押す → 該当レシピの食材を冷蔵庫から自動で引く
- 在庫が足りない場合 → 0で止める（マイナスにしない、エラーにもしない）
- 削除履歴は30日保持、その後自動削除
- 買い物完了 → チェック済み食材が冷蔵庫に追加される

**データ vs UI表示の違い（重要）:**
- **データ（DB）**: 同じ食材でも単位が違えば**別レコード**で保持
- **冷蔵庫UI**: 同じ食材名は**1アイテムにまとめて表示**（単位は無視、「キャベツ」だけ表示）
- **買い物リストUI**: 単位が違えば**別々に表示**（正確な数量が必要なため）
- **計算ロジック**: 冷蔵庫から引く際は**単位ごとに別々に処理**（同じ単位優先で引く）

→ 冷蔵庫は「何があるか」がわかれば十分。正確な数量管理は買い物リスト側で担保。

**FridgeItem:**
```json
{
  "id": "01HNK...",
  "name": "卵",
  "quantity": 6,
  "unit": "個",
  "note": "賞味期限 1/30",
  "source": "auto" | "manual",
  "updatedAt": "2026-01-27T10:00:00Z"
}
```

**DeletedFridgeItem:**
```json
{
  "id": "01HNK...",
  "name": "卵",
  "quantity": 0,
  "unit": "個",
  "deletedAt": "2026-01-25T10:00:00Z"
}
```

---

#### GET /fridge
冷蔵庫取得

**Response:**
```json
{
  "data": {
    "items": [
      {
        "id": "01HNK...",
        "name": "卵",
        "quantity": 6,
        "unit": "個",
        "note": null,
        "source": "auto",
        "updatedAt": "2026-01-27T10:00:00Z"
      }
    ]
  }
}
```

---

#### POST /fridge/items
手動追加

**Request:**
```json
{
  "name": "牛乳",
  "quantity": 1,
  "unit": "本",
  "note": "賞味期限 2/5"
}
```

**Response:**
```json
{
  "data": {
    "id": "01HNL...",
    "name": "牛乳",
    "quantity": 1,
    "unit": "本",
    "note": "賞味期限 2/5",
    "source": "manual",
    "updatedAt": "2026-01-27T10:00:00Z"
  }
}
```

---

#### PATCH /fridge/items/{id}
編集（数量変更、メモ追加など）

**Request:**
```json
{
  "quantity": 3,
  "note": "あと少し"
}
```

**Response:**
```json
{
  "data": {
    "id": "01HNK...",
    "quantity": 3,
    "note": "あと少し",
    "updatedAt": "2026-01-27T11:00:00Z"
  }
}
```

---

#### DELETE /fridge/items/{id}
削除（30日間は復元可能）

**Response:**
```json
{
  "data": {
    "id": "01HNK...",
    "deletedAt": "2026-01-27T12:00:00Z"
  }
}
```

---

#### GET /fridge/deleted
削除履歴取得（30日以内）

**Response:**
```json
{
  "data": {
    "items": [
      {
        "id": "01HNK...",
        "name": "卵",
        "quantity": 0,
        "unit": "個",
        "deletedAt": "2026-01-25T10:00:00Z"
      }
    ]
  }
}
```

---

#### POST /fridge/items/{id}/restore
削除した食材を復元

**Response:**
```json
{
  "data": {
    "id": "01HNK...",
    "name": "卵",
    "quantity": 0,
    "unit": "個",
    "source": "manual",
    "updatedAt": "2026-01-27T12:30:00Z"
  }
}
```

---

### 4-4. Recipe（レシピ帳）API

**設計方針:**
- 自分で作成したレシピ + カタログから保存したレシピが混在
- 保存したレシピは編集不可（複製して新規作成は可能）
- ページネーションはcursor方式

**必須/任意項目:**
| 項目 | API名 | 必須/任意 |
|------|-------|----------|
| 料理名 | title | **必須** |
| 何人前 | servings | **必須** |
| 材料 | ingredients | **必須**（最低1つ） |
| 作り方 | steps | **必須**（最低1つ） |
| タグ | tags | 任意 |
| 出典元URL | sourceUrl | 任意 |
| 中間素材 | intermediateMaterials | 任意 |
| 作成者 | authorName | 任意 |
| 調理時間 | cookTimeMinutes | 任意 |
| サムネイル | thumbnailUrl | 任意 |

**Recipe:**
```json
{
  "id": "01HNK...",
  "title": "甘辛チキンと焼き野菜",
  "authorName": "Kondatelab",
  "thumbnailUrl": "https://...",
  "sourceUrl": "https://...",
  "servings": 2,
  "cookTimeMinutes": 25,
  "tags": ["時短", "定番"],
  "ingredients": [
    { "name": "鶏もも肉", "quantity": 2, "unit": "枚", "order": 1 }
  ],
  "intermediateMaterials": [
    { "title": "甘辛だれ", "text": "醤油/みりん/砂糖", "order": 1 }
  ],
  "steps": [
    { "order": 1, "text": "鶏肉を一口大に切る", "timerMinutes": null }
  ],
  "savedCount": 120,
  "isSaved": true,
  "origin": "created" | "saved",
  "createdAt": "2026-01-20T09:00:00Z",
  "updatedAt": "2026-01-20T09:00:00Z"
}
```

---

#### GET /recipes
一覧取得（検索/絞り込み/並び替え対応）

**Query Parameters:**
| パラメータ | 説明 |
|-----------|------|
| limit | 取得件数（デフォルト20、最大100） |
| cursor | ページネーション用 |
| search | タイトル/タグ検索 |
| tag | タグ絞り込み |
| sort | `newest` / `oldest` / `popular` |

**Response:**
```json
{
  "data": {
    "items": [...],
    "nextCursor": "01HNL...",
    "hasMore": true
  }
}
```

---

#### GET /recipes/{id}
詳細取得

**Response:**
```json
{
  "data": {
    "id": "01HNK...",
    "title": "甘辛チキンと焼き野菜",
    ...
  }
}
```

---

#### POST /recipes
新規作成

**Request:**
```json
{
  "title": "甘辛チキンと焼き野菜",
  "servings": 2,
  "ingredients": [
    { "name": "鶏もも肉", "quantity": 2, "unit": "枚" }
  ],
  "steps": [
    { "text": "鶏肉を一口大に切る" }
  ],
  "cookTimeMinutes": 25,
  "tags": ["時短", "定番"],
  "sourceUrl": "https://...",
  "authorName": "自分",
  "intermediateMaterials": [
    { "title": "甘辛だれ", "text": "醤油/みりん/砂糖" }
  ]
}
```

**Response:**
```json
{
  "data": {
    "id": "01HNK...",
    ...
  }
}
```

---

#### PATCH /recipes/{id}
編集（origin: created のみ可能）

**Request:**
```json
{
  "title": "甘辛チキンと野菜炒め",
  "cookTimeMinutes": 30
}
```

**Response:**
```json
{
  "data": {
    "id": "01HNK...",
    "title": "甘辛チキンと野菜炒め",
    "cookTimeMinutes": 30,
    "updatedAt": "2026-01-27T15:00:00Z"
  }
}
```

**エラー（保存レシピを編集しようとした場合）:**
```json
{
  "error": {
    "code": "FORBIDDEN",
    "message": "保存したレシピは編集できません"
  }
}
```

---

#### DELETE /recipes/{id}

**Response:**
```json
{
  "data": {
    "id": "01HNK...",
    "deleted": true
  }
}
```

---

### 4-5. RecipeSet（セット）API

**RecipeSet:**
```json
{
  "id": "01HNK...",
  "title": "平日5日ゆるっとセット",
  "authorName": "Kondatelab",
  "description": "平日の献立をまとめた時短5日セット",
  "thumbnailUrl": "https://...",
  "tags": ["時短", "定番"],
  "recipeIds": ["01HNA...", "01HNB...", "01HNC..."],
  "recipes": [
    { "id": "01HNA...", "title": "...", "thumbnailUrl": "..." }
  ],
  "savedCount": 110,
  "isSaved": true,
  "origin": "created" | "saved",
  "createdAt": "2026-01-20T09:00:00Z",
  "updatedAt": "2026-01-20T09:00:00Z"
}
```

---

#### GET /sets
一覧取得

**Query Parameters:**
Recipe APIと同様（limit, cursor, search, tag, sort）

**Response:**
```json
{
  "data": {
    "items": [...],
    "nextCursor": "01HNL...",
    "hasMore": true
  }
}
```

---

#### GET /sets/{id}
詳細取得（含まれるレシピ情報も返す）

---

#### POST /sets
新規作成

**Request:**
```json
{
  "title": "平日5日ゆるっとセット",
  "description": "平日の献立をまとめた時短5日セット",
  "recipeIds": ["01HNA...", "01HNB...", "01HNC..."],
  "tags": ["時短", "定番"]
}
```

---

#### PATCH /sets/{id}
編集（origin: created のみ可能）

---

#### DELETE /sets/{id}
削除

---

### 4-6. Catalog（レシピカタログ）API

**思想:**
- レシピ帳 = 個人が拡張していく **private** なレシピ帳
- カタログ = こんだてLoopで共有する **public** なレシピカタログ

**レシピ帳との違い:**
- `statusBadges`（フリー/価格/購入済み/限定）が付く
- `isPurchased` フラグがある
- 料理家情報（creatorId, creatorName）が付く

**CatalogRecipe:**
```json
{
  "id": "01HNK...",
  "title": "甘辛チキンと焼き野菜",
  "creatorId": "01HNA...",
  "creatorName": "Kondatelab",
  "thumbnailUrl": "https://...",
  "cookTimeMinutes": 25,
  "tags": ["時短", "定番"],
  "savedCount": 120,
  "statusBadges": [
    { "label": "¥680", "variant": "price" }
  ],
  "isPurchased": false,
  "isSaved": false,
  "createdAt": "2026-01-20T09:00:00Z"
}
```

---

#### GET /catalog/recipes
一覧取得

**Query Parameters:**
| パラメータ | 説明 |
|-----------|------|
| limit | 取得件数（デフォルト20、最大100） |
| cursor | ページネーション用 |
| search | タイトル/タグ/作成者検索 |
| tag | タグ絞り込み |
| sort | `newest` / `popular` / `recommended` |
| status | `free` / `paid` / `purchased` |
| cookTime | `15` / `30` / `45`（分以内） |
| creatorId | 料理家で絞り込み |

**Response:**
```json
{
  "data": {
    "items": [...],
    "nextCursor": "01HNL...",
    "hasMore": true
  }
}
```

---

#### GET /catalog/sets
一覧取得（パラメータはrecipesと同様）

---

#### GET /catalog/recipes/{id}
詳細取得（材料/手順含む、購入済みの場合のみ全情報）

**未購入の場合:**
- タイトル、サムネイル、タグ、作成者は見れる
- 材料/手順は見れない or 一部のみ

---

#### GET /catalog/sets/{id}
詳細取得

---

#### POST /catalog/recipes/{id}/save
レシピ帳に保存

**Response:**
```json
{
  "data": {
    "id": "01HNK...",
    "savedToRecipeBook": true
  }
}
```

---

#### POST /catalog/sets/{id}/save
セットをレシピ帳に保存

---

#### POST /catalog/recipes/{id}/purchase
購入

**Request:**
```json
{
  "paymentMethodId": "01HNP..."
}
```

**Response:**
```json
{
  "data": {
    "purchaseId": "01HNQ...",
    "recipeId": "01HNK...",
    "amount": 680,
    "currency": "JPY",
    "status": "succeeded"
  }
}
```

---

#### POST /catalog/sets/{id}/purchase
セット購入

---

## 4-7. Auth（認証）API【確定】

### 認証方式
- **Hosted UI + Amplify SDK** を採用
- ログイン/新規登録/ログアウト → Cognitoにリダイレクト（APIエンドポイント不要）
- トークン管理 → Amplify SDKに任せる（localStorage）
- リフレッシュ → Amplify SDK自動
- API Gateway → Cognito Authorizerでトークン検証

### ユーザー情報管理
- **Cognito**: 認証のみ担当
- **DynamoDB（Userテーブル）**: ユーザー情報を管理

### Userテーブル設計
```json
{
  "id": "01HNK...",
  "cognitoSub": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
  "email": "user@example.com",
  "name": "たろう",
  "role": "user",
  "avatarUrl": "https://...",
  "createdAt": "2026-01-01T00:00:00Z",
  "updatedAt": "2026-01-01T00:00:00Z"
}
```

**DynamoDBキー設計:**
- PK: `USER#<id>`
- SK: `PROFILE`
- GSI1-PK: `COGNITO#<cognitoSub>`

### role の種類
初期リリース: `user` | `user_plus` のみ
将来追加: `creator` | `creator_plus`

```typescript
type UserRole = "user" | "user_plus" | "creator" | "creator_plus"
```

### エンドポイント
```
GET /auth/me    ログインユーザー情報取得
```

**Response:**
```json
{
  "data": {
    "id": "01HNK...",
    "email": "user@example.com",
    "name": "たろう",
    "role": "user",
    "avatarUrl": "https://...",
    "createdAt": "2026-01-01T00:00:00Z"
  }
}
```

### 新規登録時のフロー
```
1. ユーザーがCognito Hosted UIで登録
2. Cognito Post Confirmation Trigger（Lambda）が発火
3. LambdaがDynamoDBにUserレコードを作成
   - cognitoSubを取得
   - ULIDでidを生成
   - role: "user" で初期化
```

---

## 4-8. Import（レシピ取り込み）API【確定】

### 方針
- **JSON-LD優先** → あれば使う（正確、利用規約的にもクリーン）
- **LLMフォールバック** → JSON-LDない場合 or テキスト入力
- **確認画面で修正可能** → 即時確定ではない

### LLM選定
- **Amazon Bedrock + Claude Haiku** で開始
- 精度不足ならSonnetに切り替え（環境変数で即座に変更可能）
- コスト: 約0.2円/回（Haiku）、約2円/回（Sonnet）

### エンドポイント

#### POST /import/parse
URLまたはテキストからレシピ情報を抽出

**Request:**
```json
{
  "type": "url" | "text",
  "content": "https://... または テキスト"
}
```

**処理フロー:**
```
type === "url" の場合:
  1. HTMLフェッチ
  2. JSON-LD探す
     → あり: パースして返す
     → なし: 本文テキスト抽出 → LLM（Bedrock + Claude）でパース

type === "text" の場合:
  1. LLM（Bedrock + Claude）でパース
```

**Response:**
```json
{
  "data": {
    "draft": {
      "title": "甘辛チキン",
      "servings": 2,
      "ingredients": [
        { "name": "鶏もも肉", "quantity": 2, "unit": "枚" }
      ],
      "steps": [
        { "text": "鶏肉を一口大に切る" }
      ],
      "sourceUrl": "https://...",
      "authorName": "クックパッドユーザー",
      "cookTimeMinutes": null,
      "tags": []
    },
    "source": "json-ld" | "llm",
    "confidence": "high" | "medium" | "low"
  }
}
```

---

## 4-9. Payment（決済）API【確定】

### 決済プロバイダー
- **Stripe** を採用
- 将来的にPayPay対応も可能（Stripeで対応済み）

### 初期リリースのスコープ
- ✅ クレカ登録/管理
- ✅ 購入（公式有料レシピ用）
- ✅ 購入履歴
- ✅ サブスク（ユーザー+）
- ❌ Stripe Connect（クリエイターいないので不要）

### エンドポイント

```
# 支払い方法
POST   /payment-methods           クレカ登録
GET    /payment-methods           登録済み一覧
DELETE /payment-methods/{id}      削除

# 購入
POST   /purchases                 購入実行
GET    /purchases                 購入履歴

# サブスクリプション
POST   /subscriptions             サブスク開始（user_plus）
GET    /subscriptions             現在の状況
DELETE /subscriptions             解約
```

#### POST /payment-methods
**Request:**
```json
{
  "paymentMethodId": "pm_xxx"
}
```

**Response:**
```json
{
  "data": {
    "id": "pm_xxx",
    "brand": "visa",
    "last4": "4242",
    "expMonth": 12,
    "expYear": 2028,
    "isDefault": true
  }
}
```

#### POST /purchases
**Request:**
```json
{
  "itemType": "recipe" | "set",
  "itemId": "01HNK...",
  "paymentMethodId": "pm_xxx"
}
```

**Response:**
```json
{
  "data": {
    "purchaseId": "01HNQ...",
    "itemType": "recipe",
    "itemId": "01HNK...",
    "itemTitle": "甘辛チキンと焼き野菜",
    "amount": 680,
    "currency": "JPY",
    "status": "succeeded",
    "purchasedAt": "2026-01-27T15:00:00Z"
  }
}
```

#### POST /subscriptions
**Request:**
```json
{
  "planId": "user_plus",
  "paymentMethodId": "pm_xxx"
}
```

**Response:**
```json
{
  "data": {
    "subscriptionId": "sub_xxx",
    "planId": "user_plus",
    "status": "active",
    "currentPeriodEnd": "2026-02-27T00:00:00Z"
  }
}
```

---

## 4-10. Creator（料理家）API【初期リリースでは実装しない】

初期リリースではクリエイター機能は公開しない。
将来のために方針のみ記録。

### 将来の方針
- **Stripe Connect Express** でクリエイターへの売上分配を自動化
- 振込タイミング: 週1回 or 月1回（自動）
- 手数料: 10%〜15%（取引手数料）

### 将来実装するエンドポイント
```
POST   /creator/register          クリエイター登録（買い切り1,200円）
GET    /creator/profile           自分のプロフィール取得
PATCH  /creator/profile           プロフィール編集
GET    /creators/{id}             料理家詳細（公開ページ）
GET    /creators/{id}/recipes     料理家のレシピ一覧
GET    /creators/{id}/sets        料理家のセット一覧

# Connect
POST   /connect/onboarding        Connectオンボーディング開始
GET    /connect/status            Connect登録状況
GET    /connect/dashboard-link    Stripeダッシュボードへのリンク
GET    /connect/balance           売上残高
```

### サブスク（将来追加）
```
POST /subscriptions で planId: "creator_plus" を指定
```

---

## 4-11. Notification（通知）API【確定】

### 通知の種類
| 種類 | 対象 | 例 |
|------|------|-----|
| **ニュース** | 全員 or フォロワー | 運営お知らせ、クリエイターからのお知らせ（将来） |
| **あなた宛て** | 個人 | オンボーディング、PWAホーム追加促し、購入完了など |

### 「あなた宛て」の初期ユースケース
- **初回ログイン時**: オンボーディング系通知（使い方ガイドなど）をあなた宛てに送信
- **レシピ追加後など**: PWAホーム画面追加の促し
- **将来追加**: 購入完了、サブスク更新など

### 配信方法
- アプリ内通知（ベルアイコン + 一覧画面）
- プッシュ通知（Web Push / FCM）
- メール → ❌ やらない

### 既読管理方式
**「既読だけ管理」方式を採用**
- ニューステーブル（共通）: id, title, body, imageUrl, linkUrl, createdAt
- ユーザー既読テーブル: userId, newsId, readAt
- スケールしやすい構造

### ニュース表示のフィルタリング（重要）
**新規登録ユーザーに過去のニュースを大量表示しない**
- ニュース取得時: `createdAt >= user.createdAt` でフィルタリング
- ユーザー登録日時以降のニュースのみ表示される
- あなた宛て（personal）は元々個人宛てなのでフィルタ不要

### エンドポイント

```
# 通知一覧
GET    /notifications              通知一覧取得
POST   /notifications/read         既読にする（個別 or 全部）

# プッシュ通知
POST   /push-tokens                デバイストークン登録
DELETE /push-tokens/{token}        トークン削除

# 通知設定
GET    /notification-settings      通知設定取得
PATCH  /notification-settings      通知設定変更
```

#### GET /notifications
**Query Parameters:**
- `limit`: 取得件数（デフォルト20）
- `cursor`: ページネーション
- `type`: `news` | `personal` | `all`（デフォルト）

**Response:**
```json
{
  "data": {
    "items": [
      {
        "id": "01HNK...",
        "type": "news",
        "title": "新機能リリースのお知らせ",
        "body": "レシピ取り込み機能がパワーアップしました！",
        "imageUrl": "https://...",
        "linkUrl": "/news/01HNK...",
        "isRead": false,
        "createdAt": "2026-01-27T10:00:00Z"
      }
    ],
    "unreadCount": 3,
    "nextCursor": "01HNM...",
    "hasMore": true
  }
}
```

#### POST /notifications/read
**Request:**
```json
{
  "notificationIds": ["01HNK...", "01HNL..."]
}
```
または全て既読:
```json
{
  "all": true
}
```

**Response:**
```json
{
  "data": {
    "readCount": 3,
    "unreadCount": 0
  }
}
```

#### POST /push-tokens
**Request:**
```json
{
  "token": "fcm-device-token-xxx",
  "platform": "web"
}
```

#### GET /notification-settings
**Response:**
```json
{
  "data": {
    "pushEnabled": true,
    "categories": {
      "news": true,
      "personal": true
    }
  }
}
```

#### PATCH /notification-settings
**Request:**
```json
{
  "pushEnabled": true,
  "categories": {
    "news": true,
    "personal": false
  }
}
```

---

## 初期リリースのスコープ（重要）

### 公開するアカウント
| プラン | 価格 | 初期リリース |
|--------|------|-------------|
| ユーザー | 無料 | ✅ |
| ユーザー+ | 月額500円 | ✅ |
| クリエイター | 買い切り1,200円 | ❌ |
| クリエイター+ | 月額800円 | ❌ |

### 公開する機能
| 機能 | 初期リリース |
|------|-------------|
| 献立表/買い物リスト/冷蔵庫 | ✅ |
| レシピ帳（私的） | ✅ |
| カタログ（公式レシピのみ） | ✅ |
| レシピ取り込み（AI） | ✅ |
| 購入機能（公式有料レシピ用） | ✅ |
| サブスク（ユーザー+） | ✅ |
| クリエイター機能 | ❌ |
| フォロー機能 | ❌ |
| Stripe Connect | ❌ |

---

## 本日の成果まとめ（2026-01-27 継続）

### 前回確定
1. **ID方式**: ULID
2. **エラー形式**: 400=形式エラー、422=バリデーション、スネークケース大文字
3. **人気指標**: savedCount（MVP）

### 今回確定
4. **認証**: Hosted UI + Amplify SDK、DynamoDBでUser管理
5. **Import**: JSON-LD優先 + Bedrock Claude Haikuフォールバック
6. **決済**: Stripe、初期はユーザー+サブスク + 公式有料レシピ購入のみ
7. **初期リリーススコープ**: ユーザー/ユーザー+の2プランのみ
8. **冷蔵庫UI**: 同じ食材は単位違いでも1アイテム表示（データは別保持）
9. **カテゴリとタグの関係**: カテゴリは独立エンティティではなく、タグの「表示設定」として扱う

### カテゴリ設計（重要）
**タグベース型を採用**（凍結シートの設計は古い想定で使わない）

- カテゴリ = 「どのタグを左側の付箋タブに表示するか」の設定
- レシピがそのタグを持っていれば、そのカテゴリに表示される
- 同じレシピが複数カテゴリに出る（ui-proto-contract準拠）

**データ構造:**
```
# レシピ
Recipe: tags = ["時短", "定番", "鶏肉"]

# カテゴリ設定（どのタグを左側に表示するか）
CategorySetting:
  - userId
  - scope: book | catalog
  - tagName: "時短"    ← タグ名を参照
  - order: 1
  - isDefault: false
```

- カテゴリ追加 = 「このタグ名でカテゴリを作る」
- カテゴリに表示 = 「そのタグを持つレシピを抽出」

### 完了したAPI定義
- ✅ Plan（献立）
- ✅ Shopping（買い物リスト）
- ✅ Fridge（冷蔵庫）
- ✅ Recipe/Set（レシピ帳）
- ✅ Catalog（レシピカタログ）
- ✅ Auth（認証）
- ✅ Import（レシピ取り込み）
- ✅ Payment（決済）
- ✅ Creator（料理家）※将来方針のみ
- ✅ Notification（通知）

### 全API定義完了！

---

## 4-12. CookingLog / Archive（料理ログ・アーカイブ）【確定】

### 方針
- 初期リリースから実装
- 「作った」押下時に**自動記録**（手動追加は将来）
- 写真/コメントは**将来対応**

### データ構造

**CookingLog:**
```json
{
  "id": "01HNK...",
  "userId": "01HNA...",
  "date": "2026-01-27",
  "recipeId": "01HNJ...",
  "recipeTitle": "甘辛チキンと焼き野菜",
  "recipeThumbnailUrl": "https://...",
  "createdAt": "2026-01-27T19:30:00Z"
}
```

**ポイント:**
- `date` は日付のみ（時刻なし）→ カレンダー表示用
- `recipeTitle` / `recipeThumbnailUrl` は非正規化で保持（レシピ削除されても履歴は残る）
- 将来追加: `photoUrl`, `comment`

### 自動記録のタイミング

```
PATCH /plan/items/{id} で isCooked: true
  ↓
サーバー側で CookingLog を自動作成
  - date: 今日の日付
  - recipeId: PlanItemのrecipeId
  - recipeTitle/thumbnailUrl: Recipeから取得
```

※ `isCooked: false`（取り消し）した場合 → CookingLogは**削除しない**（一度作ったものは履歴として残す）

### DynamoDBキー設計

```
PK: USER#<userId>
SK: LOG#<date>#<id>

例:
PK: USER#01HNA...
SK: LOG#2026-01-27#01HNK...
```

→ `begins_with(SK, "LOG#2026-01")` で月単位取得可能

### UIフロー（ストーリー形式モーダル）

```
[カレンダー画面]
┌─────────────────────────────┐
│     2026年1月               │
├──┬──┬──┬──┬──┬──┬──┤
│日│月│火│水│木│金│土│
├──┼──┼──┼──┼──┼──┼──┤
│  │  │  │ 1│ 2│ 3│ 4│
│  │  │  │  │🍳│  │🍳│  ← アイコン表示
├──┼──┼──┼──┼──┼──┼──┤
│...                          │
└─────────────────────────────┘

↓ 🍳クリック

[モーダル（ストーリー形式）]
┌─────────────────────────────┐
│  ●○○   ← インジケーター    │
│                             │
│   🖼 甘辛チキンと焼き野菜    │
│                             │
│   ← スワイプで次へ →        │
└─────────────────────────────┘
```

**UI仕様:**
- 1品の場合: そのままモーダル表示
- 複数品の場合: インスタのストーリー形式でスワイプで切り替え
- インジケーター（●○○）で何品目かわかる

### APIエンドポイント

#### GET /archive
月単位でカレンダーデータを取得

**Query Parameters:**
| パラメータ | 説明 |
|-----------|------|
| month | `YYYY-MM` 形式（必須） |

**Response:**
```json
{
  "data": {
    "month": "2026-01",
    "days": [
      {
        "date": "2026-01-20",
        "count": 2,
        "hasLogs": true
      },
      {
        "date": "2026-01-21",
        "count": 1,
        "hasLogs": true
      }
    ],
    "totalCount": 15
  }
}
```

#### GET /archive/{date}
特定日の料理ログ詳細を取得（モーダル表示用）

**Path Parameter:**
- `date`: `YYYY-MM-DD` 形式

**Response:**
```json
{
  "data": {
    "date": "2026-01-27",
    "logs": [
      {
        "id": "01HNK...",
        "recipeId": "01HNJ...",
        "recipeTitle": "甘辛チキンと焼き野菜",
        "recipeThumbnailUrl": "https://...",
        "createdAt": "2026-01-27T19:30:00Z"
      },
      {
        "id": "01HNL...",
        "recipeId": "01HNM...",
        "recipeTitle": "サーモンのムニエル",
        "recipeThumbnailUrl": "https://...",
        "createdAt": "2026-01-27T20:00:00Z"
      }
    ]
  }
}
```

---

## 将来のために覚えておく方針

### Stripe Connect Express
- クリエイター機能リリース時に導入
- 売上分配の自動化（週1/月1で振込）
- クリエイターは初回にサインアップ（本人確認、銀行口座登録）

### クリエイター機能
- クリエイター登録: 買い切り1,200円
- クリエイター+: 月額800円（有料レシピ販売、メンバーシップ作成可能）
- フォロー機能はクリエイターリリースと同時に導入

---

## 4-13. ExternalShare（外部共有）API【確定】

### 仕様サマリー

| 項目 | 内容 |
|------|------|
| 目的 | レシピ/セットを外部に共有（告知拡散、おすすめ紹介） |
| 閲覧者のログイン | 不要（ゲストOK） |
| 有効期限 | 無期限（レシピ/セット削除で自動無効） |
| 停止機能 | なし |
| 出典制約 | `authorName` か `sourceUrl` のどちらか必須 |

### ライフサイクル
```
レシピ/セットが存在する → 共有URLも有効
レシピ/セットを削除   → 共有URLも無効（404になる）
```

- 一般ユーザー: レシピ帳から共有 → レシピ帳から削除で無効化
- 料理家: カタログから共有 → カタログから取り下げで無効化

### 共有URLの形式

```
/share/recipe/{recipeId}
/share/set/{setId}
```

### 出典入力のフロー

```
共有ボタン押す
  ↓
authorName or sourceUrl が既にある？
  → YES: そのまま共有URL生成
  → NO:  出典入力モーダルを表示 → 入力後に共有URL生成
```

### エンドポイント

#### POST /share
共有URL生成

**Request:**
```json
{
  "targetType": "recipe",
  "targetId": "01HNK...",
  "authorName": "自分の名前",
  "sourceUrl": "https://..."
}
```

※既にレシピに `authorName` / `sourceUrl` がある場合は省略可
※どちらもない場合は必須（バリデーションエラー）

**Response:**
```json
{
  "data": {
    "shareUrl": "https://kondate-loop.com/share/recipe/01HNK...",
    "targetType": "recipe",
    "targetId": "01HNK...",
    "authorName": "自分の名前",
    "sourceUrl": null
  }
}
```

**エラー（出典なし）:**
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "出典（authorName または sourceUrl）を入力してください"
  }
}
```

---

#### GET /share/recipe/{id}
共有レシピ取得（ゲスト閲覧用・認証不要）

**Response:**
```json
{
  "data": {
    "id": "01HNK...",
    "title": "甘辛チキンと焼き野菜",
    "authorName": "Kondatelab",
    "sourceUrl": null,
    "thumbnailUrl": "https://...",
    "servings": 2,
    "cookTimeMinutes": 25,
    "ingredients": [...],
    "steps": [...],
    "tags": ["時短", "定番"]
  }
}
```

**エラー（削除済み）:**
```json
{
  "error": {
    "code": "NOT_FOUND",
    "message": "このレシピは存在しません"
  }
}
```

---

#### GET /share/set/{id}
共有セット取得（ゲスト閲覧用・認証不要）

**Response:**
```json
{
  "data": {
    "id": "01HNK...",
    "title": "平日5日ゆるっとセット",
    "authorName": "Kondatelab",
    "description": "...",
    "thumbnailUrl": "https://...",
    "recipes": [
      { "id": "...", "title": "...", "thumbnailUrl": "..." }
    ],
    "tags": ["時短", "定番"]
  }
}
```

---

## セッション継続メモ（2026-01-28 セッション2）

### 今回確定した内容

**1. POST /plan/advance（献立昇格）**
- 全品cooked → 完了モーダル → 閉じるボタンでこのAPIを呼ぶ
- next → current に昇格、nextは空に、cookedリセット

```
POST /plan/advance

Response:
{
  "data": {
    "current": {
      "setId": "01HNJ...",
      "setTitle": "平日5日ゆるっとセット",
      "appliedAt": "2026-01-28T10:00:00Z",
      "items": [...]  // 全てisCooked: false
    },
    "next": null
  }
}
```

---

**2. カテゴリAPI**
- scope: book | catalog で別々に管理
- タグベース型（タグ名をカテゴリとして表示）
- 表示件数上限: 8件
- 「全て」は固定（非表示/削除不可）
- 既定カテゴリは編集・削除不可、非表示は可能

```
GET /categories?scope=book|catalog     一覧取得
POST /categories                        追加
PATCH /categories/{id}                  更新（非表示切替、並び順、ラベル）
DELETE /categories/{id}                 削除
```

CategorySetting:
```json
{
  "id": "01HNK...",
  "userId": "01HNA...",
  "scope": "book",
  "tagName": "和食",
  "order": 1,
  "isDefault": true,
  "isHidden": false,
  "colorTheme": "amber"
}
```

---

**3. 保存解除API**
- DELETE方式を採用（RESTful）

```
DELETE /catalog/recipes/{id}/save    レシピ保存解除
DELETE /catalog/sets/{id}/save       セット保存解除

Response:
{
  "data": {
    "recipeId": "01HNK...",
    "saved": false
  }
}
```

---

**4. User更新API**
- 編集可能: name, avatarUrl のみ
- email, role は変更不可

```
PATCH /me

Request:
{
  "name": "新しい名前",
  "avatarUrl": "https://..."
}

Response:
{
  "data": {
    "id": "01HNK...",
    "email": "user@example.com",
    "name": "新しい名前",
    "role": "user",
    "avatarUrl": "https://...",
    "updatedAt": "2026-01-28T10:00:00Z"
  }
}
```

---

## セッション継続メモ（2026-01-28 セッション1）

### 前回確定した内容

**4-13. ExternalShare（外部共有）**
- 目的: レシピ/セットを外部に共有（告知拡散、おすすめ紹介）
- 閲覧者のログイン不要（ゲストOK）
- 有効期限: 無期限（レシピ/セット削除で自動無効）
- 出典制約: `authorName` か `sourceUrl` のどちらか必須
- 共有URL形式: `/share/recipe/{id}` `/share/set/{id}`

**Diagnosis（診断）**
- **Out of scope確定**（MVPでは実装しない）

---

## セッション継続メモ（2026-01-28 前半）

### 前半で確定した内容

**4-7. CookingLog / Archive**
- 初期リリースから実装する
- 「作った」押下時に自動記録（手動追加は将来）
- 写真/コメントは将来対応
- UIはストーリー形式モーダル（インスタのストーリー的にスワイプ切り替え）

**データ構造:**
```json
{
  "id": "01HNK...",
  "userId": "01HNA...",
  "date": "2026-01-27",
  "recipeId": "01HNJ...",
  "recipeTitle": "甘辛チキンと焼き野菜",
  "recipeThumbnailUrl": "https://...",
  "createdAt": "2026-01-27T19:30:00Z"
}
```

**DynamoDBキー設計:**
```
PK: USER#<userId>
SK: LOG#<date>#<id>
```

**APIエンドポイント:**
- `GET /v1/archive?month=YYYY-MM` - 月別カレンダーデータ
- `GET /v1/archive/{date}` - 日別詳細（モーダル用）

### 次のスレッドでやること

1. API仕様定義書（最新版）を読む
2. 6番（API詳細仕様）の作成を続ける
3. 診断（Diagnosis）の扱いを決める（外す/準備中/実装）
4. 4-9. ExternalShare の方針確認

### 進捗サマリー

| セクション | 状態 |
|-----------|------|
| 4-1〜4-6 | ✅ 完了 |
| 4-7. CookingLog/Archive | ✅ 完了 |
| 4-8. CatalogPublish | ✅ 完了（簡略版） |
| 4-9. ExternalShare | ✅ 完了 |
| 4-10〜4-12 | ✅ 完了（クリエイター系は方針のみ） |
| 4-13. Notification | ✅ 完了 |
| 4-15. Category | ✅ 完了（タグベース型） |
| 4-16. RecipeBookEntry | ✅ 完了 |
| Diagnosis（診断） | ❌ Out of scope |
| 公開API（publish） | ❌ MVP外（直接DB投入） |
| POST /plan/advance | ✅ 完了 |
| カテゴリAPI | ✅ 完了 |
| 保存解除API | ✅ 完了 |
| User更新API | ✅ 完了 |
| **6. API詳細仕様** | ✅ **全API定義完了** |

### Out of scope（MVP外）まとめ
- 診断（Diagnosis）API
- 公開API（POST /publish, POST /publish/stop）→ 公式レシピは直接DB投入
- クリエイター/メンバーシップAPI
- フォロー機能
