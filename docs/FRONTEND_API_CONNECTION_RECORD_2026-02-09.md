# Frontend API 接続記録 (2026-02-09)

## 1. 目的
- `apps/web` をモック固定状態から、`VITE_API_USE_MOCK=false` 時にバックエンド API (`/v1/recipes`, `/v1/sets`) を読む状態へ接続。

## 2. 実装内容
- `apps/web/src/App.tsx`
  - `API_USE_MOCK` を参照し、`false` の場合のみ初期ロードを実行。
  - 初期ロードで以下を並列実行:
    - `listRecipeBookRecipes()`
    - `listRecipeBookSets()`
    - `listCatalogRecipes()`
    - `listCatalogSets()`
  - 取得結果を `myRecipes`, `mySets`, `publicRecipes`, `publicSets` に反映。
  - 初期の `currentSet`, `nextSet` も API 取得結果で上書き。

- `apps/web/src/services/recipes.ts`
  - エンドポイントを `"/recipe-book/recipes"` / `"/catalog/recipes"` から `"/v1/recipes"` に切替。
  - API レスポンス `data.items` をフロント表示型へマッピング:
    - `authorName -> author`
    - `thumbnailUrl -> imageUrl`
    - `ingredients[].quantity -> ingredients[].amount`
  - カタログ表示用の `statusBadges` を付与。

- `apps/web/src/services/sets.ts`
  - エンドポイントを `"/recipe-book/sets"` / `"/catalog/sets"` から `"/v1/sets"` に切替。
  - API レスポンス `data.items` をフロント表示型へマッピング:
    - `authorName -> author`
    - `thumbnailUrl -> imageUrl`
    - `recipeIds.length -> count`
  - カタログ表示用の `statusBadges` を付与。

## 3. 現在の制約
- カタログ専用 API (`/v1/catalog/*`) は未接続のため、現状 `listCatalog*` も `"/v1/recipes"` / `"/v1/sets"` を利用。
- `auth` 系 (`/auth/login` など) は今回の作業対象外。

## 4. 動作確認メモ
- コマンド: `npm run build` (repo root)
  - TypeScript コンパイルは通過。
  - ただし環境依存で Rollup optional dependency 欠落により bundling 失敗:
    - `Cannot find module @rollup/rollup-win32-x64-msvc`
- そのため、最終確認は `VITE_API_USE_MOCK=false` での画面実操作で実施する前提。
