/**
 * API Endpoint Types
 * @see API仕様定義書 6.1, 6.2
 */

import type { ApiResponse, PaginatedResponse, ListQueryParams, PaginationParams } from "./common";
import type {
  UserPublic,
  Recipe,
  RecipeListItem,
  RecipeCreateInput,
  RecipeUpdateInput,
  RecipeSet,
  RecipeSetListItem,
  RecipeSetCreateInput,
  RecipeSetUpdateInput,
  Plan,
  PlanSlotData,
  PlanSelectSetInput,
  PlanItemUpdateInput,
  PlanItem,
  ShoppingList,
  ShoppingItem,
  ShoppingItemCreateInput,
  ShoppingItemUpdateInput,
  ShoppingCompleteResult,
  Fridge,
  FridgeItem,
  FridgeItemCreateInput,
  FridgeItemUpdateInput,
  DeletedFridgeItem,
  CatalogRecipe,
  CatalogSet,
  CatalogQueryParams,
  ImportParseInput,
  ImportParseResult,
  ArchiveMonth,
  ArchiveDayDetail,
  ShareCreateInput,
  ShareResult,
  SharedRecipe,
  SharedSet,
  Category,
  CategoryScope,
  CategoryCreateInput,
  CategoryUpdateInput,
  PaymentMethod,
  PaymentMethodCreateInput,
  Purchase,
  PurchaseCreateInput,
  Subscription,
  SubscriptionCreateInput,
  NotificationList,
  NotificationReadInput,
  NotificationReadResult,
  NotificationSettings,
  NotificationSettingsUpdateInput,
  PushTokenCreateInput,
  NotificationType,
} from "../models";

// ============================================================
// Auth
// ============================================================

export type GetAuthMeResponse = ApiResponse<UserPublic>;

export type AuthSessionData = {
  user: UserPublic & { updatedAt?: string | null };
  accessToken: string;
  refreshToken: string;
  tokenType: "Bearer";
  expiresIn: number;
  issuedAt: string;
};

export type PostAuthCallbackRequest = {
  code?: string;
  idToken?: string;
  accessToken?: string;
  refreshToken?: string;
  userId?: string;
  email?: string;
  name?: string;
  avatarUrl?: string | null;
};
export type PostAuthCallbackResponse = ApiResponse<AuthSessionData>;

export type PostAuthRefreshRequest = {
  refreshToken: string;
  userId?: string;
  email?: string;
};
export type PostAuthRefreshResponse = ApiResponse<AuthSessionData>;

export type PostAuthLogoutRequest = {
  refreshToken?: string;
};
export type PostAuthLogoutResponse = ApiResponse<{ loggedOut: boolean; revokedRefreshToken: boolean }>;

// ============================================================
// User
// ============================================================

export type PatchMeRequest = {
  name?: string;
  avatarUrl?: string;
};
export type PatchMeResponse = ApiResponse<UserPublic & { updatedAt: string }>;

// ============================================================
// Plan
// ============================================================

export type GetPlanResponse = ApiResponse<Plan>;

export type PostPlanSelectSetRequest = PlanSelectSetInput;
export type PostPlanSelectSetResponse = ApiResponse<PlanSlotData>;

export type PostPlanAdvanceResponse = ApiResponse<Plan>;

export type PatchPlanItemRequest = PlanItemUpdateInput;
export type PatchPlanItemResponse = ApiResponse<Pick<PlanItem, "id" | "isCooked" | "cookedAt">>;

// ============================================================
// Shopping List
// ============================================================

export type GetShoppingListResponse = ApiResponse<ShoppingList>;

export type PostShoppingListItemRequest = ShoppingItemCreateInput;
export type PostShoppingListItemResponse = ApiResponse<ShoppingItem>;

export type PatchShoppingListItemRequest = ShoppingItemUpdateInput;
export type PatchShoppingListItemResponse = ApiResponse<Pick<ShoppingItem, "id" | "checked">>;

export type PostShoppingListCompleteResponse = ApiResponse<ShoppingCompleteResult>;

// ============================================================
// Fridge
// ============================================================

export type GetFridgeResponse = ApiResponse<Fridge>;

export type PostFridgeItemRequest = FridgeItemCreateInput;
export type PostFridgeItemResponse = ApiResponse<FridgeItem>;

export type PatchFridgeItemRequest = FridgeItemUpdateInput;
export type PatchFridgeItemResponse = ApiResponse<Pick<FridgeItem, "id" | "quantity" | "note" | "updatedAt">>;

export type DeleteFridgeItemResponse = ApiResponse<{ id: string; deletedAt: string }>;

export type GetFridgeDeletedResponse = ApiResponse<{ items: DeletedFridgeItem[] }>;

export type PostFridgeItemRestoreResponse = ApiResponse<FridgeItem>;

// ============================================================
// Recipe
// ============================================================

export type GetRecipesParams = ListQueryParams;
export type GetRecipesResponse = PaginatedResponse<RecipeListItem>;

export type GetRecipeResponse = ApiResponse<Recipe>;

export type PostRecipeRequest = RecipeCreateInput;
export type PostRecipeResponse = ApiResponse<Recipe>;

export type PatchRecipeRequest = RecipeUpdateInput;
export type PatchRecipeResponse = ApiResponse<Pick<Recipe, "id" | "title" | "updatedAt"> & Partial<Recipe>>;

export type DeleteRecipeResponse = ApiResponse<{ id: string; deleted: boolean }>;

// ============================================================
// Set
// ============================================================

export type GetSetsParams = ListQueryParams;
export type GetSetsResponse = PaginatedResponse<RecipeSetListItem>;

export type GetSetResponse = ApiResponse<RecipeSet>;

export type PostSetRequest = RecipeSetCreateInput;
export type PostSetResponse = ApiResponse<RecipeSet>;

export type PatchSetRequest = RecipeSetUpdateInput;
export type PatchSetResponse = ApiResponse<Pick<RecipeSet, "id" | "updatedAt"> & Partial<RecipeSet>>;

export type DeleteSetResponse = ApiResponse<{ id: string; deleted: boolean }>;

// ============================================================
// Import
// ============================================================

export type PostImportParseRequest = ImportParseInput;
export type PostImportParseResponse = ApiResponse<ImportParseResult>;

// ============================================================
// Catalog
// ============================================================

export type GetCatalogRecipesParams = CatalogQueryParams;
export type GetCatalogRecipesResponse = PaginatedResponse<CatalogRecipe>;

export type GetCatalogSetsParams = CatalogQueryParams;
export type GetCatalogSetsResponse = PaginatedResponse<CatalogSet>;

export type GetCatalogRecipeResponse = ApiResponse<CatalogRecipe & Partial<Recipe>>;
export type GetCatalogSetResponse = ApiResponse<CatalogSet & Partial<RecipeSet>>;

export type PostCatalogSaveResponse = ApiResponse<{ id: string; savedToRecipeBook: boolean }>;
export type DeleteCatalogSaveResponse = ApiResponse<{ recipeId?: string; setId?: string; saved: false }>;

export type PostCatalogPurchaseRequest = { paymentMethodId: string };
export type PostCatalogPurchaseResponse = ApiResponse<Purchase>;

// ============================================================
// Share
// ============================================================

export type PostShareRequest = ShareCreateInput;
export type PostShareResponse = ApiResponse<ShareResult>;

export type GetShareRecipeResponse = ApiResponse<SharedRecipe>;
export type GetShareSetResponse = ApiResponse<SharedSet>;

// ============================================================
// Category
// ============================================================

export type GetCategoriesParams = { scope: CategoryScope };
export type GetCategoriesResponse = ApiResponse<{ items: Category[] }>;

export type PostCategoryRequest = CategoryCreateInput;
export type PostCategoryResponse = ApiResponse<Category>;

export type PatchCategoryRequest = CategoryUpdateInput;
export type PatchCategoryResponse = ApiResponse<Category>;

export type DeleteCategoryResponse = ApiResponse<{ id: string; deleted: boolean }>;

// ============================================================
// Archive
// ============================================================

export type GetArchiveParams = { month: string }; // YYYY-MM
export type GetArchiveResponse = ApiResponse<ArchiveMonth>;

export type GetArchiveDateResponse = ApiResponse<ArchiveDayDetail>;

// ============================================================
// Payment
// ============================================================

export type PostPaymentMethodRequest = PaymentMethodCreateInput;
export type PostPaymentMethodResponse = ApiResponse<PaymentMethod>;

export type GetPaymentMethodsResponse = ApiResponse<{ items: PaymentMethod[] }>;

export type DeletePaymentMethodResponse = ApiResponse<{ id: string; deleted: boolean }>;

export type PostPurchaseRequest = PurchaseCreateInput;
export type PostPurchaseResponse = ApiResponse<Purchase>;

export type GetPurchasesParams = PaginationParams;
export type GetPurchasesResponse = PaginatedResponse<Purchase>;

export type PostSubscriptionRequest = SubscriptionCreateInput;
export type PostSubscriptionResponse = ApiResponse<Subscription>;

export type GetSubscriptionResponse = ApiResponse<Subscription | null>;

export type DeleteSubscriptionResponse = ApiResponse<{ canceled: boolean }>;

// ============================================================
// Notification
// ============================================================

export type GetNotificationsParams = PaginationParams & { type?: NotificationType | "all" };
export type GetNotificationsResponse = ApiResponse<NotificationList>;

export type PostNotificationsReadRequest = NotificationReadInput;
export type PostNotificationsReadResponse = ApiResponse<NotificationReadResult>;

export type PostPushTokenRequest = PushTokenCreateInput;
export type PostPushTokenResponse = ApiResponse<{ token: string; registered: boolean }>;

export type DeletePushTokenResponse = ApiResponse<{ token: string; deleted: boolean }>;

export type GetNotificationSettingsResponse = ApiResponse<NotificationSettings>;

export type PatchNotificationSettingsRequest = NotificationSettingsUpdateInput;
export type PatchNotificationSettingsResponse = ApiResponse<NotificationSettings>;
