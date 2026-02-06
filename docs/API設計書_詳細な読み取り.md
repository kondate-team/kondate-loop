# Kondate Loop API仕様定義書（凍結版）

> 作成日: 2026-01-27
> 更新日: 2026-01-28
> バージョン: v1.0（MVP）
> 参照プロト: https://1212ki.github.io/kondate-loop-proto/

---

## 6.0 共通仕様（全API共通）

### 6.0.1 Base

| 項目 | 値 |
|------|-----|
| Base URL | `https://api.kondate-loop.com` |
| API Prefix | `/v1`（例：`/v1/recipes`） |
| Content-Type | `application/json; charset=utf-8` |
| Timezone | `UTC` |
| 日時フォーマット | ISO8601（例：`2026-01-27T01:00:00Z`） |

### 6.0.2 認証

| 項目 | 値 |
|------|-----|
| 認証方式 | Cognito Hosted UI + Amplify SDK |
| Authorization Header | `Authorization: Bearer <JWT>` |
| トークン管理 | Amplify SDKに委譲（localStorage） |
| リフレッシュ | Amplify SDK自動 |
| API Gateway | Cognito Authorizerでトークン検証 |

### 6.0.3 ID方式

| 項目 | 値 |
|------|-----|
| ID形式 | **ULID** |
| 理由 | DynamoDB Sort Keyで時系列ソート可能、URLが短い |
| ライブラリ | `ulid` パッケージ |

### 6.0.4 共通エラーフォーマット

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

### 6.0.5 エラーコード一覧

| コード | HTTP Status | 用途 |
|--------|-------------|------|
| `INVALID_REQUEST` | 400 | JSONパースエラー等 |
| `UNAUTHORIZED` | 401 | 認証エラー |
| `FORBIDDEN` | 403 | 権限エラー |
| `NOT_FOUND` | 404 | リソースなし |
| `CONFLICT` | 409 | 重複登録・状態不整合 |
| `VALIDATION_ERROR` | 422 | バリデーションエラー |
| `INTERNAL_ERROR` | 500 | サーバーエラー |
| `IMPORT_FETCH_FAILED` | 400 | URLフェッチ失敗（Import） |
| `IMPORT_PARSE_FAILED` | 400 | パース失敗（Import） |
| `IMPORT_TIMEOUT` | 400 | タイムアウト（Import） |


### 6.0.6 ページネーション

| 項目 | 値 |
|------|-----|
| 方式 | cursor |
| パラメータ | `limit`, `cursor` |
| デフォルト件数 | 20 |
| 最大件数 | 100 |

**レスポンス形式:**
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

## 6.1 エンドポイント一覧（MVP）

### 6.1.1 Auth（認証）

| Method | Path | Summary | Auth |
|--------|------|---------|------|
| GET | `/v1/auth/me` | ログインユーザー情報取得 | ✅ |

### 6.1.2 User（ユーザー）

| Method | Path | Summary | Auth |
|--------|------|---------|------|
| PATCH | `/v1/me` | ユーザー情報更新 | ✅ |

### 6.1.3 Plan（献立）

| Method | Path | Summary | Auth |
|--------|------|---------|------|
| GET | `/v1/plan` | 現在の献立取得 | ✅ |
| POST | `/v1/plan/select-set` | セット適用 | ✅ |
| POST | `/v1/plan/advance` | 献立昇格（next→current） | ✅ |
| PATCH | `/v1/plan/items/{id}` | 作ったトグル | ✅ |

### 6.1.4 Shopping（買い物リスト）

| Method | Path | Summary | Auth |
|--------|------|---------|------|
| GET | `/v1/shopping-list` | 買い物リスト取得 | ✅ |
| POST | `/v1/shopping-list/items` | 手動追加 | ✅ |
| PATCH | `/v1/shopping-list/items/{id}` | チェックON/OFF | ✅ |
| POST | `/v1/shopping-list/complete` | 買い物完了 | ✅ |

### 6.1.5 Fridge（冷蔵庫）

| Method | Path | Summary | Auth |
|--------|------|---------|------|
| GET | `/v1/fridge` | 冷蔵庫取得 | ✅ |
| POST | `/v1/fridge/items` | 手動追加 | ✅ |
| PATCH | `/v1/fridge/items/{id}` | 編集 | ✅ |
| DELETE | `/v1/fridge/items/{id}` | 削除 | ✅ |
| GET | `/v1/fridge/deleted` | 削除履歴取得 | ✅ |
| POST | `/v1/fridge/items/{id}/restore` | 復元 | ✅ |

### 6.1.6 Recipe（レシピ）

| Method | Path | Summary | Auth |
|--------|------|---------|------|
| GET | `/v1/recipes` | 一覧取得 | ✅ |
| GET | `/v1/recipes/{id}` | 詳細取得 | ✅ |
| POST | `/v1/recipes` | 新規作成 | ✅ |
| PATCH | `/v1/recipes/{id}` | 編集 | ✅ |
| DELETE | `/v1/recipes/{id}` | 削除 | ✅ |

### 6.1.7 Set（セット）

| Method | Path | Summary | Auth |
|--------|------|---------|------|
| GET | `/v1/sets` | 一覧取得 | ✅ |
| GET | `/v1/sets/{id}` | 詳細取得 | ✅ |
| POST | `/v1/sets` | 新規作成 | ✅ |
| PATCH | `/v1/sets/{id}` | 編集 | ✅ |
| DELETE | `/v1/sets/{id}` | 削除 | ✅ |

### 6.1.8 Import（取り込み）

| Method | Path | Summary | Auth |
|--------|------|---------|------|
| POST | `/v1/import/parse` | URLまたはテキストからレシピ抽出 | ✅ |

### 6.1.9 Catalog（カタログ）

| Method | Path | Summary | Auth |
|--------|------|---------|------|
| GET | `/v1/catalog/recipes` | レシピ一覧 | ✅ |
| GET | `/v1/catalog/sets` | セット一覧 | ✅ |
| GET | `/v1/catalog/recipes/{id}` | レシピ詳細 | ✅ |
| GET | `/v1/catalog/sets/{id}` | セット詳細 | ✅ |
| POST | `/v1/catalog/recipes/{id}/save` | レシピ保存 | ✅ |
| POST | `/v1/catalog/sets/{id}/save` | セット保存 | ✅ |
| DELETE | `/v1/catalog/recipes/{id}/save` | レシピ保存解除 | ✅ |
| DELETE | `/v1/catalog/sets/{id}/save` | セット保存解除 | ✅ |
| POST | `/v1/catalog/recipes/{id}/purchase` | レシピ購入 | ✅ |
| POST | `/v1/catalog/sets/{id}/purchase` | セット購入 | ✅ |

### 6.1.10 Share（外部共有）

| Method | Path | Summary | Auth |
|--------|------|---------|------|
| POST | `/v1/share` | 共有URL生成 | ✅ |
| GET | `/v1/share/recipe/{id}` | 共有レシピ取得 | ❌ |
| GET | `/v1/share/set/{id}` | 共有セット取得 | ❌ |

### 6.1.11 Category（カテゴリ）

| Method | Path | Summary | Auth |
|--------|------|---------|------|
| GET | `/v1/categories` | 一覧取得 | ✅ |
| POST | `/v1/categories` | 追加 | ✅ |
| PATCH | `/v1/categories/{id}` | 更新 | ✅ |
| DELETE | `/v1/categories/{id}` | 削除 | ✅ |

### 6.1.12 Archive（アーカイブ）

| Method | Path | Summary | Auth |
|--------|------|---------|------|
| GET | `/v1/archive` | 月別カレンダーデータ | ✅ |
| GET | `/v1/archive/{date}` | 日別詳細 | ✅ |

### 6.1.13 Payment（決済）

| Method | Path | Summary | Auth |
|--------|------|---------|------|
| POST | `/v1/payment-methods` | クレカ登録 | ✅ |
| GET | `/v1/payment-methods` | 登録済み一覧 | ✅ |
| DELETE | `/v1/payment-methods/{id}` | 削除 | ✅ |
| POST | `/v1/purchases` | 購入実行 | ✅ |
| GET | `/v1/purchases` | 購入履歴 | ✅ |
| POST | `/v1/subscriptions` | サブスク開始 | ✅ |
| GET | `/v1/subscriptions` | 現在の状況 | ✅ |
| DELETE | `/v1/subscriptions` | 解約 | ✅ |

### 6.1.14 Notification（通知）

| Method | Path | Summary | Auth |
|--------|------|---------|------|
| GET | `/v1/notifications` | 通知一覧 | ✅ |
| POST | `/v1/notifications/read` | 既読にする | ✅ |
| POST | `/v1/push-tokens` | デバイストークン登録 | ✅ |
| DELETE | `/v1/push-tokens/{token}` | トークン削除 | ✅ |
| GET | `/v1/notification-settings` | 通知設定取得 | ✅ |
| PATCH | `/v1/notification-settings` | 通知設定変更 | ✅ |

---

## 6.2 エンドポイント詳細

---

### 6.2.1 【Auth】GET /v1/auth/me

| 項目 | 内容 |
|------|------|
| Summary | ログインユーザー情報取得 |
| Auth | Required |
| Roles | user, user_plus |
<!-- creator,creator_plusはMVPでは不要なので定義不要？コメントアウトする？？
Cognitoグループ設計、権限制御（Authorizer後のRBAC）、Catalogデータモデルが "MVPで要るのか要らないのか" がブレます。-->
<!-- ✅ 回答: MVPでは `user` / `user_plus` のみ。creator/creator_plusはMVP外のためRolesから削除。Cognitoグループは `user` / `user_plus` の2種類のみ作成。 -->

#### Response (200)

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

---

### 6.2.2 【User】PATCH /v1/me

| 項目 | 内容 |
|------|------|
| Summary | ユーザー情報更新 |
| Auth | Required |
| Roles | user, user_plus, creator, creator_plus |

#### Request Body

| Field | Required | Type | Validation |
|-------|----------|------|------------|
| name | ❌ | string | 1〜30文字 |
| avatarUrl | ❌ | string | URL形式 |

```json
{
  "name": "新しい名前",
  "avatarUrl": "https://..."
}
```

#### Response (200)

```json
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

### 6.2.3 【Plan】GET /v1/plan

| 項目 | 内容 |
|------|------|
| Summary | 現在の献立取得 |
| Auth | Required |

#### Response (200)

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

### 6.2.4 【Plan】POST /v1/plan/select-set

| 項目 | 内容 |
|------|------|
| Summary | セットを献立に適用 |
| Auth | Required |

#### Request Body

| Field | Required | Type | Description |
|-------|----------|------|-------------|
| setId | ✅ | string | セットID |
| slot | ✅ | string | `current` or `next` |

```json
{
  "setId": "01HNJ...",
  "slot": "current"
}
```

#### Response (200)

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

### 6.2.5 【Plan】POST /v1/plan/advance

| 項目 | 内容 |
|------|------|
| Summary | 献立昇格（next→current） |
| Auth | Required |
| Side Effects | next→currentに昇格、cookedリセット、買い物リスト再構築 |
<!-- 「買い物リスト再構築」の定義、差分更新なのか全消し再生成なのかでテーブル設計/トランザクション方針が変わります。 -->
<!-- ✅ 回答: **全消し再生成**。advanceはセット切り替えのタイミングなので、既存リストをクリアして新セットの材料から再生成する。トランザクションで「旧リスト削除→新リスト作成」を一括実行。 -->
<!-- 「冷蔵庫から食材消費」が、名前一致？単位換算？不足時どうする？ が未定義。
→レシピ材料を元に削除するから不足とか起きない認識。ありなしで考えるから単位換算も不要・・・これをどう仕様書に落としこむか -->
<!-- ✅ 回答: MVPでは**冷蔵庫から自動消費しない**。買い物リストUIに「🏠 冷蔵庫にある材料」を参考表示するのみ。単位換算・在庫差し引きはMVP外。詳細は `仕様まとめ_詳細な読み取り.md` セクション3を参照。 -->


#### Request Body

なし

#### Response (200)

```json
{
  "data": {
    "current": {
      "setId": "01HNJ...",
      "setTitle": "平日5日ゆるっとセット",
      "appliedAt": "2026-01-28T10:00:00Z",
      "items": [...]
    },
    "next": null
  }
}
```

#### Errors

| Status | Code | When |
|--------|------|------|
| 409 | `CONFLICT` | nextが空の場合 |

---

### 6.2.6 【Plan】PATCH /v1/plan/items/{id}

| 項目 | 内容 |
|------|------|
| Summary | 作ったトグル |
| Auth | Required |
| Side Effects | isCooked:trueの場合、CookingLog自動作成、冷蔵庫から食材消費 |

#### Request Body

| Field | Required | Type |
|-------|----------|------|
| isCooked | ✅ | boolean |

```json
{ "isCooked": true }
```

#### Response (200)

```json
{
  "data": {
    "id": "01HNK...",
    "isCooked": true,
    "cookedAt": "2026-01-27T19:30:00Z"
  }
}
```

---

### 6.2.7 【Shopping】GET /v1/shopping-list

| 項目 | 内容 |
|------|------|
| Summary | 買い物リスト取得 |
| Auth | Required |

#### Response (200)

```json
{
  "data": {
    "items": [
      {
        "id": "01HNK...",
        "name": "鶏もも肉",
        "quantity": "2",
        "unit": "枚",
        "checked": false,
        "source": "auto"
      }
    ]
  }
}
```

---

### 6.2.8 【Shopping】POST /v1/shopping-list/items

| 項目 | 内容 |
|------|------|
| Summary | 手動追加 |
| Auth | Required |

#### Request Body

| Field | Required | Type |
|-------|----------|------|
| name | ✅ | string |
| quantity | ✅ | string |
| unit | ✅ | string |

```json
{
  "name": "牛乳",
  "quantity": "1",
  "unit": "本"
}
```

#### Response (201)

```json
{
  "data": {
    "id": "01HNL...",
    "name": "牛乳",
    "quantity": "1",
    "unit": "本",
    "checked": false,
    "source": "manual"
  }
}
```

---

### 6.2.9 【Shopping】PATCH /v1/shopping-list/items/{id}

| 項目 | 内容 |
|------|------|
| Summary | チェックON/OFF |
| Auth | Required |

#### Request Body

```json
{ "checked": true }
```

#### Response (200)

```json
{
  "data": {
    "id": "01HNK...",
    "checked": true
  }
}
```

---

### 6.2.10 【Shopping】POST /v1/shopping-list/complete

| 項目 | 内容 |
|------|------|
| Summary | 買い物完了（チェック済みを冷蔵庫へ） |
| Auth | Required |

#### Request Body

なし

#### Response (200)

```json
{
  "data": {
    "movedToFridge": 5,
    "remaining": 2
  }
}
```

---

### 6.2.11 【Fridge】GET /v1/fridge

| 項目 | 内容 |
|------|------|
| Summary | 冷蔵庫取得 |
| Auth | Required |

#### Response (200)

```json
{
  "data": {
    "items": [
      {
        "id": "01HNK...",
        "name": "卵",
        "quantity": "6",
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

### 6.2.12 【Fridge】POST /v1/fridge/items

| 項目 | 内容 |
|------|------|
| Summary | 手動追加 |
| Auth | Required |

#### Request Body

| Field | Required | Type |
|-------|----------|------|
| name | ✅ | string |
| quantity | ✅ | string |
| unit | ✅ | string |
| note | ❌ | string |

```json
{
  "name": "牛乳",
  "quantity": "1",
  "unit": "本",
  "note": "賞味期限 2/5"
}
```

#### Response (201)

```json
{
  "data": {
    "id": "01HNL...",
    "name": "牛乳",
    "quantity": "1",
    "unit": "本",
    "note": "賞味期限 2/5",
    "source": "manual",
    "updatedAt": "2026-01-27T10:00:00Z"
  }
}
```

---

### 6.2.13 【Fridge】PATCH /v1/fridge/items/{id}

| 項目 | 内容 |
|------|------|
| Summary | 編集 |
| Auth | Required |

#### Request Body

```json
{
  "quantity": "3",
  "note": "あと少し"
}
```

#### Response (200)

```json
{
  "data": {
    "id": "01HNK...",
    "quantity": "3",
    "note": "あと少し",
    "updatedAt": "2026-01-27T11:00:00Z"
  }
}
```

---

### 6.2.14 【Fridge】DELETE /v1/fridge/items/{id}

| 項目 | 内容 |
|------|------|
| Summary | 削除（30日間は復元可能） |
| Auth | Required |

#### Response (200)

```json
{
  "data": {
    "id": "01HNK...",
    "deletedAt": "2026-01-27T12:00:00Z"
  }
}
```

---

### 6.2.15 【Fridge】GET /v1/fridge/deleted

| 項目 | 内容 |
|------|------|
| Summary | 削除履歴取得（30日以内） |
| Auth | Required |

#### Response (200)

```json
{
  "data": {
    "items": [
      {
        "id": "01HNK...",
        "name": "卵",
        "quantity": "6",
        "unit": "個",
        "deletedAt": "2026-01-25T10:00:00Z"
      }
    ]
  }
}
```
<!-- "quantity": 0,は書き間違えかな？ありなし判定だからture/false -->
<!-- ✅ 回答: `quantity` は **string型**（"2", "100g", "半分" 等の文字列）に統一。削除履歴でもstring型で保持。 -->

---

### 6.2.16 【Fridge】POST /v1/fridge/items/{id}/restore

| 項目 | 内容 |
|------|------|
| Summary | 削除した食材を復元 |
| Auth | Required |

#### Response (200)

```json
{
  "data": {
    "id": "01HNK...",
    "name": "卵",
    "quantity": "6",
    "unit": "個",
    "source": "manual",
    "updatedAt": "2026-01-27T12:30:00Z"
  }
}
```

---

### 6.2.17 【Recipe】GET /v1/recipes

| 項目 | 内容 |
|------|------|
| Summary | 一覧取得（検索/絞り込み/並び替え対応） |
| Auth | Required |

#### Query Parameters

| Name | Required | Type | Description |
|------|----------|------|-------------|
| limit | ❌ | number | 取得件数（デフォルト20、最大100） |
| cursor | ❌ | string | ページネーション用 |
| search | ❌ | string | タイトル/タグ検索 |
| tag | ❌ | string | タグ絞り込み |
| sort | ❌ | string | `newest` / `oldest` / `popular` |

#### Response (200)

```json
{
  "data": {
    "items": [
      {
        "id": "01HNK...",
        "title": "甘辛チキンと焼き野菜",
        "authorName": "Kondatelab",
        "thumbnailUrl": "https://...",
        "cookTimeMinutes": 25,
        "tags": ["時短", "定番"],
        "savedCount": 120,
        "isSaved": true,
        "origin": "created",
        "createdAt": "2026-01-20T09:00:00Z"
      }
    ],
    "nextCursor": "01HNL...",
    "hasMore": true
  }
}
```

---

### 6.2.18 【Recipe】GET /v1/recipes/{id}

| 項目 | 内容 |
|------|------|
| Summary | 詳細取得 |
| Auth | Required |

#### Response (200)

```json
{
  "data": {
    "id": "01HNK...",
    "title": "甘辛チキンと焼き野菜",
    "authorName": "Kondatelab",
    "thumbnailUrl": "https://...",
    "sourceUrl": "https://...",
    "servings": 2,
    "cookTimeMinutes": 25,
    "tags": ["時短", "定番"],
    "ingredients": [
      { "name": "鶏もも肉", "quantity": "2", "unit": "枚", "order": 1 }
    ],
    "intermediateMaterials": [
      { "title": "甘辛だれ", "text": "醤油/みりん/砂糖", "order": 1 }
    ],
    "steps": [
      { "order": 1, "text": "鶏肉を一口大に切る", "timerMinutes": null }
    ],
    "savedCount": 120,
    "isSaved": true,
    "origin": "created",
    "createdAt": "2026-01-20T09:00:00Z",
    "updatedAt": "2026-01-20T09:00:00Z"
  }
}
```

---

### 6.2.19 【Recipe】POST /v1/recipes

| 項目 | 内容 |
|------|------|
| Summary | 新規作成 |
| Auth | Required |

#### Request Body

| Field | Required | Type | Validation |
|-------|----------|------|------------|
| title | ✅ | string | 1〜80文字 |
| servings | ✅ | number | 1以上 |
| ingredients | ✅ | array | 最低1つ |
| steps | ✅ | array | 最低1つ |
| cookTimeMinutes | ❌ | number | - |
| tags | ❌ | array | - |
| sourceUrl | ❌ | string | URL形式 |
| authorName | ❌ | string | - |
| intermediateMaterials | ❌ | array | - |

```json
{
  "title": "甘辛チキンと焼き野菜",
  "servings": 2,
  "ingredients": [
    { "name": "鶏もも肉", "quantity": "2", "unit": "枚" }
  ],
  "steps": [
    { "text": "鶏肉を一口大に切る" }
  ],
  "cookTimeMinutes": 25,
  "tags": ["時短", "定番"]
}
```

#### Response (201)

```json
{
  "data": {
    "id": "01HNK...",
    ...
  }
}
```

---

### 6.2.20 【Recipe】PATCH /v1/recipes/{id}

| 項目 | 内容 |
|------|------|
| Summary | 編集（origin: created のみ可能） |
| Auth | Required |

#### Request Body

更新したいフィールドのみ送信

#### Response (200)

```json
{
  "data": {
    "id": "01HNK...",
    "title": "甘辛チキンと野菜炒め",
    "updatedAt": "2026-01-27T15:00:00Z"
  }
}
```

#### Errors

| Status | Code | When |
|--------|------|------|
| 403 | `FORBIDDEN` | 保存したレシピを編集しようとした場合 |

---

### 6.2.21 【Recipe】DELETE /v1/recipes/{id}

| 項目 | 内容 |
|------|------|
| Summary | 削除 |
| Auth | Required |

#### Response (200)

```json
{
  "data": {
    "id": "01HNK...",
    "deleted": true
  }
}
```

---

### 6.2.22 【Set】GET /v1/sets

| 項目 | 内容 |
|------|------|
| Summary | 一覧取得 |
| Auth | Required |

※Query ParametersはRecipeと同様

#### Response (200)

```json
{
  "data": {
    "items": [
      {
        "id": "01HNK...",
        "title": "平日5日ゆるっとセット",
        "authorName": "Kondatelab",
        "description": "平日の献立をまとめた時短5日セット",
        "thumbnailUrl": "https://...",
        "tags": ["時短", "定番"],
        "recipeIds": ["01HNA...", "01HNB...", "01HNC..."],
        "savedCount": 110,
        "isSaved": true,
        "origin": "created",
        "createdAt": "2026-01-20T09:00:00Z"
      }
    ],
    "nextCursor": "01HNL...",
    "hasMore": true
  }
}
```

---

### 6.2.23 【Set】GET /v1/sets/{id}

| 項目 | 内容 |
|------|------|
| Summary | 詳細取得（含まれるレシピ情報も返す） |
| Auth | Required |

#### Response (200)

```json
{
  "data": {
    "id": "01HNK...",
    "title": "平日5日ゆるっとセット",
    "authorName": "Kondatelab",
    "description": "...",
    "thumbnailUrl": "https://...",
    "tags": ["時短", "定番"],
    "recipeIds": ["01HNA...", "01HNB...", "01HNC..."],
    "recipes": [
      { "id": "01HNA...", "title": "...", "thumbnailUrl": "..." }
    ],
    "savedCount": 110,
    "isSaved": true,
    "origin": "created",
    "createdAt": "2026-01-20T09:00:00Z",
    "updatedAt": "2026-01-20T09:00:00Z"
  }
}
```

---

### 6.2.24 【Set】POST /v1/sets

| 項目 | 内容 |
|------|------|
| Summary | 新規作成 |
| Auth | Required |

#### Request Body

| Field | Required | Type |
|-------|----------|------|
| title | ✅ | string |
| recipeIds | ✅ | array |
| description | ❌ | string |
| tags | ❌ | array |

```json
{
  "title": "平日5日ゆるっとセット",
  "description": "平日の献立をまとめた時短5日セット",
  "recipeIds": ["01HNA...", "01HNB...", "01HNC..."],
  "tags": ["時短", "定番"]
}
```

---

### 6.2.25 【Set】PATCH /v1/sets/{id}

| 項目 | 内容 |
|------|------|
| Summary | 編集（origin: created のみ可能） |
| Auth | Required |

---

### 6.2.26 【Set】DELETE /v1/sets/{id}

| 項目 | 内容 |
|------|------|
| Summary | 削除 |
| Auth | Required |

---

### 6.2.27 【Import】POST /v1/import/parse

| 項目 | 内容 |
|------|------|
| Summary | URLまたはテキストからレシピ情報を抽出 |
| Auth | Required |
| Processing | JSON-LD優先 → LLM（Bedrock + Claude Haiku）フォールバック |

#### Request Body

| Field | Required | Type | Description |
|-------|----------|------|-------------|
| type | ✅ | string | `url` or `text` |
| content | ✅ | string | URLまたはテキスト |

```json
{
  "type": "url",
  "content": "https://cookpad.com/recipe/..."
}
```

#### Response (200)

```json
{
  "data": {
    "draft": {
      "title": "甘辛チキン",
      "servings": 2,
      "ingredients": [
        { "name": "鶏もも肉", "quantity": "2", "unit": "枚" }
      ],
      "steps": [
        { "text": "鶏肉を一口大に切る" }
      ],
      "sourceUrl": "https://...",
      "authorName": "クックパッドユーザー",
      "cookTimeMinutes": null,
      "tags": []
    },
    "source": "json-ld",
    "confidence": "high"
  }
}
```

#### Errors

| Status | Code | When |
|--------|------|------|
| 400 | `IMPORT_FETCH_FAILED` | URLフェッチ失敗 |
| 400 | `IMPORT_PARSE_FAILED` | パース失敗 |
| 400 | `IMPORT_TIMEOUT` | タイムアウト |

--
<!-- G. Catalog系は"ルートはあるが、詳細仕様が欠けているものが複数" →MVPでは実装しないから定義してない？？
例：
GET /v1/catalog/sets：詳細レスポンスが無い（「Queryはrecipesと同様」のみ）
GET /v1/catalog/recipes/{id}：未購入時の扱いの注記はあるが、レスポンススキーマが無い
GET /v1/catalog/sets/{id}：同様にレスポンスが無い
POST /v1/catalog/sets/{id}/save / DELETE /v1/catalog/sets/{id}/save：詳細が欠落
POST /v1/catalog/sets/{id}/purchase：詳細が欠落
→ CatalogはAPI Gatewayルート作成まではOKですが、Lambda実装テンプレ（入出力の型）を固めるには情報不足です。 -->
<!-- ✅ 回答: 指摘の通り。Catalog系はMVPで**ルート定義のみ**、詳細レスポンスは実装フェーズで追記する方針。MVP初期は公式レシピ直接DB投入のため、Catalog APIの優先度は低い。APIルートは予約だけしておき、詳細スキーマは後続タスクで定義する。 -->

### 6.2.28 【Catalog】GET /v1/catalog/recipes

| 項目 | 内容 |
|------|------|
| Summary | カタログレシピ一覧 |
| Auth | Required |

#### Query Parameters

| Name | Required | Type | Description |
|------|----------|------|-------------|
| limit | ❌ | number | 取得件数 |
| cursor | ❌ | string | ページネーション |
| search | ❌ | string | タイトル/タグ/作成者検索 |
| tag | ❌ | string | タグ絞り込み |
| sort | ❌ | string | `newest` / `popular` / `recommended` |
| status | ❌ | string | `free` / `paid` / `purchased` |
| cookTime | ❌ | number | 15/30/45（分以内） |
| creatorId | ❌ | string | 料理家で絞り込み |

#### Response (200)

```json
{
  "data": {
    "items": [
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
    ],
    "nextCursor": "01HNL...",
    "hasMore": true
  }
}
```

---

### 6.2.29 【Catalog】GET /v1/catalog/sets

| 項目 | 内容 |
|------|------|
| Summary | カタログセット一覧 |
| Auth | Required |

※パラメータはrecipesと同様

---

### 6.2.30 【Catalog】GET /v1/catalog/recipes/{id}

| 項目 | 内容 |
|------|------|
| Summary | カタログレシピ詳細 |
| Auth | Required |
| Note | 未購入の場合、材料/手順は見れない or 一部のみ |

---

### 6.2.31 【Catalog】GET /v1/catalog/sets/{id}

| 項目 | 内容 |
|------|------|
| Summary | カタログセット詳細 |
| Auth | Required |

---

### 6.2.32 【Catalog】POST /v1/catalog/recipes/{id}/save

| 項目 | 内容 |
|------|------|
| Summary | レシピをレシピ帳に保存 |
| Auth | Required |

#### Response (200)

```json
{
  "data": {
    "id": "01HNK...",
    "savedToRecipeBook": true
  }
}
```

---

### 6.2.33 【Catalog】POST /v1/catalog/sets/{id}/save

| 項目 | 内容 |
|------|------|
| Summary | セットをレシピ帳に保存 |
| Auth | Required |

---

### 6.2.34 【Catalog】DELETE /v1/catalog/recipes/{id}/save

| 項目 | 内容 |
|------|------|
| Summary | レシピ保存解除 |
| Auth | Required |

#### Response (200)

```json
{
  "data": {
    "recipeId": "01HNK...",
    "saved": false
  }
}
```

---

### 6.2.35 【Catalog】DELETE /v1/catalog/sets/{id}/save

| 項目 | 内容 |
|------|------|
| Summary | セット保存解除 |
| Auth | Required |

#### Response (200)

```json
{
  "data": {
    "setId": "01HNK...",
    "saved": false
  }
}
```

---

### 6.2.36 【Catalog】POST /v1/catalog/recipes/{id}/purchase

| 項目 | 内容 |
|------|------|
| Summary | レシピ購入 |
| Auth | Required |

#### Request Body

```json
{
  "paymentMethodId": "pm_xxx"
}
```

#### Response (200)

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

### 6.2.37 【Catalog】POST /v1/catalog/sets/{id}/purchase

| 項目 | 内容 |
|------|------|
| Summary | セット購入 |
| Auth | Required |

---

### 6.2.38 【Share】POST /v1/share

| 項目 | 内容 |
|------|------|
| Summary | 共有URL生成 |
| Auth | Required |
| 出典制約 | authorName か sourceUrl のどちらか必須 |

#### Request Body

| Field | Required | Type | Description |
|-------|----------|------|-------------|
| targetType | ✅ | string | `recipe` or `set` |
| targetId | ✅ | string | レシピ/セットID |
| authorName | ❌ | string | 出典（レシピになければ必須） |
| sourceUrl | ❌ | string | 出典URL（レシピになければ必須） |

```json
{
  "targetType": "recipe",
  "targetId": "01HNK...",
  "authorName": "自分の名前"
}
```

#### Response (200)

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
<!-- C. 共有URLの"トークン設計"が弱い（recipeIdがそのままURLに見える）
共有URL生成のレスポンス例が https://kondate-loop.com/share/recipe/01HNK... のように targetId（レシピID）がURLに露出しています。
さらにゲスト閲覧APIは GET /v1/share/recipe/{id}（Auth None）で {id} が 01HNK... になっています。
・気になる点
ULIDは推測困難ではありますが、**「共有を無効化する」「漏洩時に再発行する」**などがやりづらい設計になりがちです（shareIdの概念がないため）。
共有セット取得 GET /v1/share/set/{id} は 詳細仕様（レスポンス）が欠落しています。
API設計書_詳細な読み取り
・提案
{id} を "shareId（ランダムトークン）" にして、サーバ側で targetId へ解決する設計が安全。 -->
<!-- ✅ 回答: 指摘を採用。**shareId（ランダムトークン）方式**に変更する。
- POST /v1/share のレスポンスに `shareId` を追加
- GET /v1/share/recipe/{shareId}, GET /v1/share/set/{shareId} の形式に変更
- Shareテーブルを作成し、shareId → targetType + targetId のマッピングを管理
- 共有無効化・再発行が可能になる設計
→ 詳細は別途DB設計書・API詳細を更新する -->

#### Errors

| Status | Code | When |
|--------|------|------|
| 422 | `VALIDATION_ERROR` | 出典なし |

---

### 6.2.39 【Share】GET /v1/share/recipe/{id}

| 項目 | 内容 |
|------|------|
| Summary | 共有レシピ取得（ゲスト閲覧用） |
| Auth | **None** |

#### Response (200)

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

#### Errors

| Status | Code | When |
|--------|------|------|
| 404 | `NOT_FOUND` | レシピ削除済み |

---

### 6.2.40 【Share】GET /v1/share/set/{id}

| 項目 | 内容 |
|------|------|
| Summary | 共有セット取得（ゲスト閲覧用） |
| Auth | **None** |

---

### 6.2.41 【Category】GET /v1/categories

| 項目 | 内容 |
|------|------|
| Summary | カテゴリ一覧取得 |
| Auth | Required |

#### Query Parameters

| Name | Required | Type | Description |
|------|----------|------|-------------|
| scope | ✅ | string | `book` or `catalog` |

#### Response (200)

```json
{
  "data": {
    "items": [
      {
        "id": "01HNK...",
        "tagName": "全て",
        "order": 0,
        "isDefault": true,
        "isHidden": false,
        "colorTheme": "muted"
      },
      {
        "id": "01HNL...",
        "tagName": "和食",
        "order": 1,
        "isDefault": true,
        "isHidden": false,
        "colorTheme": "amber"
      }
    ]
  }
}
```

---

### 6.2.42 【Category】POST /v1/categories

| 項目 | 内容 |
|------|------|
| Summary | カテゴリ追加 |
| Auth | Required |
| 制約 | 表示件数上限8件 |

#### Request Body

| Field | Required | Type |
|-------|----------|------|
| scope | ✅ | string |
| tagName | ✅ | string |

```json
{
  "scope": "book",
  "tagName": "ヘルシー"
}
```

#### Response (201)

```json
{
  "data": {
    "id": "01HNM...",
    "tagName": "ヘルシー",
    "order": 5,
    "isDefault": false,
    "isHidden": false,
    "colorTheme": null
  }
}
```

---

### 6.2.43 【Category】PATCH /v1/categories/{id}

| 項目 | 内容 |
|------|------|
| Summary | カテゴリ更新 |
| Auth | Required |
| 制約 | isDefault:trueのカテゴリはtagName変更不可 |

#### Request Body

```json
{
  "isHidden": true
}
```
または
```json
{
  "order": 3
}
```
または
```json
{
  "tagName": "時短レシピ"
}
```

---

### 6.2.44 【Category】DELETE /v1/categories/{id}

| 項目 | 内容 |
|------|------|
| Summary | カテゴリ削除 |
| Auth | Required |
| 制約 | isDefault:trueのカテゴリは削除不可 |

#### Response (200)

```json
{
  "data": {
    "id": "01HNM...",
    "deleted": true
  }
}
```

---

### 6.2.45 【Archive】GET /v1/archive

| 項目 | 内容 |
|------|------|
| Summary | 月別カレンダーデータ取得 |
| Auth | Required |

#### Query Parameters

| Name | Required | Type | Description |
|------|----------|------|-------------|
| month | ✅ | string | `YYYY-MM` 形式 |

#### Response (200)

```json
{
  "data": {
    "month": "2026-01",
    "days": [
      {
        "date": "2026-01-20",
        "count": 2,
        "hasLogs": true
      }
    ],
    "totalCount": 15
  }
}
```

---

### 6.2.46 【Archive】GET /v1/archive/{date}

| 項目 | 内容 |
|------|------|
| Summary | 日別詳細取得（モーダル表示用） |
| Auth | Required |

#### Path Parameter

- `date`: `YYYY-MM-DD` 形式

#### Response (200)

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
      }
    ]
  }
}
```

---
<!-- H. Payment/Subscription/Push-token は"一覧・削除系のレスポンスが不足" →決済API実装できたから不要だったりする？？ここに取り込めるなら取り込んでほしい
GET /v1/payment-methods / DELETE /v1/payment-methods/{id}：詳細レスポンスなし
GET /v1/purchases：詳細レスポンスなし
GET /v1/subscriptions / DELETE /v1/subscriptions：詳細レスポンスなし
POST /v1/push-tokens / DELETE /v1/push-tokens/{token}：Requestはあるがレスポンス例が無い
また、paymentMethodId: "pm_xxx" や subscriptionId: "sub_xxx" といった 外部決済事業者っぽいIDが混在しています。
→ ここも ルート作成はOK、ただし Lambdaの入出力・DDB保存形式は追加定義が欲しいです。 -->
<!-- ✅ 回答: 指摘の通り。以下の方針で詳細を追記する:
- `pm_xxx` / `sub_xxx` は **Stripe ID** をそのまま使用（DDBにも保存）
- 内部ULIDは発行しない（Stripe IDで十分、乗り換えもほぼないためシンプルに）
- 詳細レスポンススキーマは下記各セクションに追記済み（一部は追記予定）
- Push-tokenのレスポンスは `{ "data": { "registered": true } }` 形式で統一 -->

### 6.2.47 【Payment】POST /v1/payment-methods

| 項目 | 内容 |
|------|------|
| Summary | クレカ登録 |
| Auth | Required |

#### Request Body

```json
{
  "paymentMethodId": "pm_xxx"
}
```

#### Response (201)

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

---

### 6.2.48 【Payment】GET /v1/payment-methods

| 項目 | 内容 |
|------|------|
| Summary | 登録済み一覧 |
| Auth | Required |

---

### 6.2.49 【Payment】DELETE /v1/payment-methods/{id}

| 項目 | 内容 |
|------|------|
| Summary | 削除 |
| Auth | Required |

---

### 6.2.50 【Payment】POST /v1/purchases

| 項目 | 内容 |
|------|------|
| Summary | 購入実行 |
| Auth | Required |

#### Request Body

```json
{
  "itemType": "recipe",
  "itemId": "01HNK...",
  "paymentMethodId": "pm_xxx"
}
```

#### Response (200)

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

---

### 6.2.51 【Payment】GET /v1/purchases

| 項目 | 内容 |
|------|------|
| Summary | 購入履歴 |
| Auth | Required |

---

### 6.2.52 【Payment】POST /v1/subscriptions

| 項目 | 内容 |
|------|------|
| Summary | サブスク開始（user_plus） |
| Auth | Required |

#### Request Body

```json
{
  "planId": "user_plus",
  "paymentMethodId": "pm_xxx"
}
```

#### Response (200)

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

### 6.2.53 【Payment】GET /v1/subscriptions

| 項目 | 内容 |
|------|------|
| Summary | 現在の状況 |
| Auth | Required |

---

### 6.2.54 【Payment】DELETE /v1/subscriptions

| 項目 | 内容 |
|------|------|
| Summary | 解約 |
| Auth | Required |

---

### 6.2.55 【Notification】GET /v1/notifications

| 項目 | 内容 |
|------|------|
| Summary | 通知一覧取得 |
| Auth | Required |

#### Query Parameters

| Name | Required | Type | Description |
|------|----------|------|-------------|
| limit | ❌ | number | 取得件数（デフォルト20） |
| cursor | ❌ | string | ページネーション |
| type | ❌ | string | `news` / `personal` / `all`（デフォルト） |

#### Response (200)

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

---

### 6.2.56 【Notification】POST /v1/notifications/read

| 項目 | 内容 |
|------|------|
| Summary | 既読にする |
| Auth | Required |

#### Request Body

個別既読:
```json
{
  "notificationIds": ["01HNK...", "01HNL..."]
}
```

全て既読:
```json
{
  "all": true
}
```

#### Response (200)

```json
{
  "data": {
    "readCount": 3,
    "unreadCount": 0
  }
}
```

---

### 6.2.57 【Notification】POST /v1/push-tokens

| 項目 | 内容 |
|------|------|
| Summary | デバイストークン登録 |
| Auth | Required |

#### Request Body

```json
{
  "token": "fcm-device-token-xxx",
  "platform": "web"
}
```

---

### 6.2.58 【Notification】DELETE /v1/push-tokens/{token}

| 項目 | 内容 |
|------|------|
| Summary | トークン削除 |
| Auth | Required |

---

### 6.2.59 【Notification】GET /v1/notification-settings

| 項目 | 内容 |
|------|------|
| Summary | 通知設定取得 |
| Auth | Required |

#### Response (200)

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

---

### 6.2.60 【Notification】PATCH /v1/notification-settings

| 項目 | 内容 |
|------|------|
| Summary | 通知設定変更 |
| Auth | Required |

#### Request Body

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

## 6.3 Out of scope（MVP外）

以下のAPIはMVPでは実装しない：

| 機能 | 理由 |
|------|------|
| 診断（Diagnosis）API | 機能自体をMVP外とした |
| 公開API（POST /publish 等） | 公式レシピは直接DB投入 |
| クリエイター/メンバーシップAPI | クリエイター機能はMVP外 |
| フォロー機能API | MVP外 |

---

## 変更ログ

| 日付 | 変更内容 | 担当 |
|------|---------|------|
| 2026-01-27 | 初版作成 | - |
| 2026-01-28 | advance/カテゴリ/保存解除/User更新 追加、Out of scope確定 | - |
| 2026-02-06 | レビュー指摘への回答を追記、quantity型をstring統一、RolesからMVP外のcreator系を削除 | - |
