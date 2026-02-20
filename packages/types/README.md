# @kondate-loop/types

こんだてLoop の FE/BE 共通型定義パッケージです。

## 概要

API仕様定義書（60エンドポイント）に基づき、以下を提供します：

- **モデル型定義** - Recipe, Plan, ShoppingList 等のドメインモデル
- **API型定義** - Request/Response の型（60エンドポイント分）
- **Zodスキーマ** - フォームバリデーション用スキーマ
- **エラーコード** - 統一エラーコードと日本語メッセージ

## インストール

モノレポ内での参照：

```json
// apps/web/package.json
{
  "dependencies": {
    "@kondate-loop/types": "workspace:*"
  }
}
```

## 使用方法

### モデル型

```typescript
import type {
  Recipe,
  RecipeCreateInput,
  Plan,
  PlanSlot,
  ShoppingList,
  ShoppingItem,
  User,
  UserRole,
} from "@kondate-loop/types";

// レシピ作成
const newRecipe: RecipeCreateInput = {
  title: "カレーライス",
  servings: 4,
  cookingTime: 60,
  ingredients: [
    { name: "玉ねぎ", amount: "2個" },
    { name: "じゃがいも", amount: "3個" },
  ],
};
```

### API型

```typescript
import type {
  GetPlanResponse,
  PostRecipeRequest,
  PostRecipeResponse,
  GetRecipesParams,
  PaginatedResponse,
} from "@kondate-loop/types/api";

// APIクライアントでの使用例
async function createRecipe(data: PostRecipeRequest): Promise<PostRecipeResponse> {
  const res = await fetch("/api/v1/recipes", {
    method: "POST",
    body: JSON.stringify(data),
  });
  return res.json();
}
```

### Zodスキーマ（バリデーション）

```typescript
import {
  recipeCreateInputSchema,
  planSelectSetInputSchema,
  shoppingItemCreateInputSchema,
} from "@kondate-loop/types/schemas";

// フォームバリデーション
const result = recipeCreateInputSchema.safeParse(formData);
if (!result.success) {
  console.error(result.error.flatten());
}

// React Hook Form との連携
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

const form = useForm({
  resolver: zodResolver(recipeCreateInputSchema),
});
```

### エラーコード

```typescript
import {
  ErrorCodes,
  ErrorCodeToStatus,
  ErrorMessages,
} from "@kondate-loop/types/errors";

// エラーハンドリング
if (error.code === ErrorCodes.IMPORT_LIMIT_EXCEEDED) {
  // HTTP 429
  toast.error(ErrorMessages[ErrorCodes.IMPORT_LIMIT_EXCEEDED]);
  // → "今月の取り込み回数上限に達しました"
}

// HTTPステータスの取得
const status = ErrorCodeToStatus[ErrorCodes.UNAUTHORIZED]; // 401
```

## ディレクトリ構成

```
packages/types/
├── src/
│   ├── index.ts           # ルートエクスポート
│   ├── models/            # ドメインモデル型
│   │   ├── user.ts        # User, UserRole, UserPublic
│   │   ├── recipe.ts      # Recipe, Ingredient, RecipeStep
│   │   ├── set.ts         # RecipeSet, RecipeSetListItem
│   │   ├── plan.ts        # Plan, PlanSlot, PlanItem
│   │   ├── shopping.ts    # ShoppingItem, ShoppingList
│   │   ├── fridge.ts      # FridgeItem, Fridge
│   │   ├── catalog.ts     # CatalogRecipe, CatalogSet
│   │   ├── import.ts      # ImportParseInput, ImportParseResult
│   │   ├── archive.ts     # ArchiveMonth, ArchiveDayDetail
│   │   ├── share.ts       # ShareCreateInput, SharedRecipe
│   │   ├── category.ts    # Category
│   │   ├── payment.ts     # PaymentMethod, Subscription, Purchase
│   │   └── notification.ts # Notification, NotificationSettings
│   ├── api/               # API Request/Response型
│   │   ├── common.ts      # ApiResponse, PaginatedResponse
│   │   └── endpoints.ts   # 60エンドポイント分の型
│   ├── schemas/           # Zodバリデーションスキーマ
│   │   ├── common.ts      # ulidSchema, paginationSchema
│   │   ├── recipe.ts      # recipeCreateInputSchema
│   │   ├── set.ts         # recipeSetCreateInputSchema
│   │   └── ...            # 各モデル対応スキーマ
│   └── errors/            # エラーコード定数
│       └── codes.ts       # ErrorCodes, ErrorCodeToStatus, ErrorMessages
├── package.json
├── tsconfig.json
└── README.md
```

## エクスポートパス

| パス | 内容 |
|------|------|
| `@kondate-loop/types` | 全エクスポート（モデル、API、スキーマ、エラー） |
| `@kondate-loop/types/models` | モデル型のみ |
| `@kondate-loop/types/api` | API型のみ |
| `@kondate-loop/types/schemas` | Zodスキーマのみ |
| `@kondate-loop/types/errors` | エラーコードのみ |

## API仕様書との対応

このパッケージは以下の仕様書に基づいています：

- `knowledge/side-business/kondate-loop/02_仕様/API仕様定義書_埋め込み済み.md`

### エンドポイント対応表（抜粋）

| エンドポイント | Request型 | Response型 |
|---------------|-----------|------------|
| `GET /v1/auth/me` | - | `GetAuthMeResponse` |
| `POST /v1/auth/callback` | `PostAuthCallbackRequest` | `PostAuthCallbackResponse` |
| `POST /v1/auth/refresh` | `PostAuthRefreshRequest` | `PostAuthRefreshResponse` |
| `POST /v1/auth/logout` | `PostAuthLogoutRequest` | `PostAuthLogoutResponse` |
| `GET /v1/plan` | - | `GetPlanResponse` |
| `POST /v1/plan/select-set` | `PostPlanSelectSetRequest` | `PostPlanSelectSetResponse` |
| `GET /v1/recipes` | `GetRecipesParams` | `GetRecipesResponse` |
| `POST /v1/recipes` | `PostRecipeRequest` | `PostRecipeResponse` |
| `POST /v1/import/parse` | `PostImportParseRequest` | `PostImportParseResponse` |

全60エンドポイントの型定義は `src/api/endpoints.ts` を参照してください。

## ビルド

```bash
cd packages/types
npm install
npm run build
```

## 開発時の注意

- 型定義を変更したら必ず `npm run build` を実行
- API仕様書を変更したらこのパッケージも更新する
- Zodスキーマはモデル型と整合性を保つこと
