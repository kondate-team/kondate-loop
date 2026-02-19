export type PlanType = "free" | "user_plus" | "creator_plus" | "creator";
export type UserRole = "user" | "user_plus" | "creator" | "creator_plus";

export type UserRecord = {
  userId: string;
  email: string;
  name?: string | null;
  role?: UserRole;
  avatarUrl?: string | null;
  createdAt?: string;
  updatedAt?: string;
  stripeCustomerId?: string;
  stripeDefaultPaymentMethodId?: string;
  stripeSubscriptionId?: string;
  stripeConnectAccountId?: string;
  plan?: PlanType;
  subscriptionStatus?: string;
  connectOnboardingComplete?: boolean;
};

export type RecipeRecord = {
  id: string;
  userId: string;
  title: string;
  authorName: string | null;
  thumbnailUrl: string | null;
  sourceUrl: string | null;
  servings: number;
  cookTimeMinutes: number | null;
  tags: string[];
  ingredients: Array<{ name: string; quantity: number; unit: string }>;
  steps: Array<{ text: string }>;
  intermediateMaterials: Array<{ title: string; text: string }>;
  savedCount: number;
  isSaved: boolean;
  origin: "created" | "saved";
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
};

export type SetRecord = {
  id: string;
  userId: string;
  title: string;
  authorName: string | null;
  description: string | null;
  thumbnailUrl: string | null;
  tags: string[];
  recipeIds: string[];
  savedCount: number;
  isSaved: boolean;
  origin: "created" | "saved";
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
};

export type CategoryScope = "book" | "catalog";
export type PurchaseItemType = "recipe" | "set";
export type PurchaseStatus = "succeeded" | "failed" | "pending";
export type SubscriptionPlanId = "user_plus" | "creator_plus";
export type SubscriptionStatus = "active" | "canceling" | "canceled" | "past_due" | "incomplete";
export type NotificationType = "news" | "personal";
export type NotificationPlatform = "web";

export type CategoryRecord = {
  id: string;
  userId: string;
  scope: CategoryScope;
  tagName: string;
  order: number;
  isDefault: boolean;
  isHidden: boolean;
  colorTheme: string | null;
  createdAt: string;
  updatedAt: string;
};

export type PlanItemRecord = {
  id: string;
  recipeId: string;
  title: string;
  thumbnailUrl: string | null;
  isCooked: boolean;
  cookedAt: string | null;
};

export type PlanSlotRecord = {
  setId: string;
  setTitle: string;
  appliedAt: string;
  items: PlanItemRecord[];
};

export type PlanRecord = {
  current: PlanSlotRecord | null;
  next: PlanSlotRecord | null;
};

export type CookLogRecord = {
  id: string;
  userId: string;
  recipeId: string;
  recipeTitle: string;
  recipeThumbnailUrl: string | null;
  createdAt: string;
};

export type PaymentMethodRecord = {
  id: string;
  userId: string;
  brand: string;
  last4: string;
  expMonth: number;
  expYear: number;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
};

export type PurchaseRecord = {
  purchaseId: string;
  userId: string;
  itemType: PurchaseItemType;
  itemId: string;
  itemTitle: string;
  amount: number;
  currency: "JPY";
  status: PurchaseStatus;
  purchasedAt: string;
};

export type SubscriptionRecord = {
  subscriptionId: string;
  userId: string;
  planId: SubscriptionPlanId;
  status: SubscriptionStatus;
  currentPeriodEnd: string;
  updatedAt: string;
};

export type NotificationRecord = {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  imageUrl: string | null;
  linkUrl: string | null;
  isRead: boolean;
  createdAt: string;
};

export type PushTokenRecord = {
  userId: string;
  token: string;
  platform: NotificationPlatform;
  createdAt: string;
};

export type NotificationSettingsRecord = {
  userId: string;
  pushEnabled: boolean;
  categories: {
    news: boolean;
    personal: boolean;
  };
  updatedAt: string;
};

export type ShoppingItemRecord = {
  id: string;
  userId: string;
  name: string;
  quantity: number;
  unit: string;
  checked: boolean;
  source: "auto" | "manual";
};

export type FridgeItemRecord = {
  id: string;
  userId: string;
  name: string;
  quantity: number;
  unit: string;
  note: string | null;
  source: "auto" | "manual";
  updatedAt: string;
};

export type DeletedFridgeItemRecord = {
  id: string;
  userId: string;
  name: string;
  quantity: number;
  unit: string;
  deletedAt: string;
};

export type CreateRecipeInput = Partial<RecipeRecord> & {
  title: string;
  servings: number;
  userId: string;
};

export type CreateSetInput = Partial<SetRecord> & {
  title: string;
  recipeIds: string[];
  userId: string;
};

export type DataStore = {
  upsertUser(userId: string, email: string): Promise<UserRecord>;
  getUser(userId: string): Promise<UserRecord | null>;
  updateUser(userId: string, patch: Partial<UserRecord>): Promise<UserRecord | null>;
  findUserByCustomerId(customerId: string): Promise<UserRecord | null>;
  updateUserByCustomerId(
    customerId: string,
    patch: Partial<UserRecord>
  ): Promise<UserRecord | null>;

  createRecipe(input: CreateRecipeInput): Promise<RecipeRecord>;
  listRecipes(userId: string): Promise<RecipeRecord[]>;
  getRecipe(userId: string, recipeId: string): Promise<RecipeRecord | null>;
  updateRecipe(
    userId: string,
    recipeId: string,
    patch: Partial<RecipeRecord>
  ): Promise<RecipeRecord | null>;
  deleteRecipe(userId: string, recipeId: string): Promise<boolean>;

  createSet(input: CreateSetInput): Promise<SetRecord>;
  listSets(userId: string): Promise<SetRecord[]>;
  getSet(userId: string, setId: string): Promise<SetRecord | null>;
  updateSet(userId: string, setId: string, patch: Partial<SetRecord>): Promise<SetRecord | null>;
  deleteSet(userId: string, setId: string): Promise<boolean>;
  listCatalogRecipes(): Promise<RecipeRecord[]>;
  listCatalogSets(): Promise<SetRecord[]>;
  getCatalogRecipe(recipeId: string): Promise<RecipeRecord | null>;
  getCatalogSet(setId: string): Promise<SetRecord | null>;
  saveCatalogRecipe(userId: string, recipeId: string): Promise<RecipeRecord | null>;
  unsaveCatalogRecipe(userId: string, recipeId: string): Promise<boolean>;
  saveCatalogSet(userId: string, setId: string): Promise<SetRecord | null>;
  unsaveCatalogSet(userId: string, setId: string): Promise<boolean>;
  listCategories(userId: string, scope: CategoryScope): Promise<CategoryRecord[]>;
  createCategory(userId: string, scope: CategoryScope, tagName: string): Promise<CategoryRecord>;
  updateCategory(
    userId: string,
    categoryId: string,
    patch: Partial<Pick<CategoryRecord, "tagName" | "order" | "isHidden">>
  ): Promise<CategoryRecord | null>;
  deleteCategory(userId: string, categoryId: string): Promise<boolean>;
  listCookLogsByMonth(userId: string, month: string): Promise<CookLogRecord[]>;
  listCookLogsByDate(userId: string, date: string): Promise<CookLogRecord[]>;
  upsertPaymentMethod(
    userId: string,
    method: Omit<PaymentMethodRecord, "userId" | "createdAt" | "updatedAt">
  ): Promise<PaymentMethodRecord>;
  listPaymentMethods(userId: string): Promise<PaymentMethodRecord[]>;
  deletePaymentMethod(userId: string, paymentMethodId: string): Promise<boolean>;
  createPurchase(
    userId: string,
    input: Omit<PurchaseRecord, "userId" | "purchaseId" | "purchasedAt">
  ): Promise<PurchaseRecord>;
  listPurchases(userId: string): Promise<PurchaseRecord[]>;
  upsertSubscription(
    userId: string,
    input: Omit<SubscriptionRecord, "userId" | "updatedAt">
  ): Promise<SubscriptionRecord>;
  getSubscription(userId: string): Promise<SubscriptionRecord | null>;
  deleteSubscription(userId: string): Promise<boolean>;
  listNotifications(userId: string): Promise<NotificationRecord[]>;
  markNotificationsRead(
    userId: string,
    input: { notificationIds?: string[]; all?: boolean }
  ): Promise<{ readCount: number; unreadCount: number }>;
  upsertPushToken(userId: string, token: string, platform: NotificationPlatform): Promise<boolean>;
  deletePushToken(userId: string, token: string): Promise<boolean>;
  getNotificationSettings(userId: string): Promise<NotificationSettingsRecord>;
  updateNotificationSettings(
    userId: string,
    patch: {
      pushEnabled?: boolean;
      categories?: Partial<NotificationSettingsRecord["categories"]>;
    }
  ): Promise<NotificationSettingsRecord>;

  getPlan(userId: string): Promise<PlanRecord>;
  setPlanSlot(userId: string, slot: "current" | "next", data: PlanSlotRecord): Promise<PlanSlotRecord>;
  clearPlanSlot(userId: string, slot: "current" | "next"): Promise<void>;
  updatePlanItemCooked(
    userId: string,
    itemId: string,
    isCooked: boolean
  ): Promise<Pick<PlanItemRecord, "id" | "isCooked" | "cookedAt"> | null>;

  listShoppingItems(userId: string): Promise<ShoppingItemRecord[]>;
  createShoppingItem(
    userId: string,
    input: Pick<ShoppingItemRecord, "name" | "quantity" | "unit">
  ): Promise<ShoppingItemRecord>;
  updateShoppingItem(
    userId: string,
    itemId: string,
    patch: Partial<ShoppingItemRecord>
  ): Promise<ShoppingItemRecord | null>;
  deleteShoppingItem(userId: string, itemId: string): Promise<boolean>;
  completeShopping(userId: string): Promise<{ movedToFridge: number; remaining: number }>;

  listFridgeItems(userId: string): Promise<FridgeItemRecord[]>;
  createFridgeItem(
    userId: string,
    input: Pick<FridgeItemRecord, "name" | "quantity" | "unit" | "note">
  ): Promise<FridgeItemRecord>;
  updateFridgeItem(
    userId: string,
    itemId: string,
    patch: Partial<FridgeItemRecord>
  ): Promise<FridgeItemRecord | null>;
  deleteFridgeItem(userId: string, itemId: string): Promise<DeletedFridgeItemRecord | null>;
  listDeletedFridgeItems(userId: string): Promise<DeletedFridgeItemRecord[]>;
  restoreFridgeItem(userId: string, itemId: string): Promise<FridgeItemRecord | null>;
  buildPlanItems(userId: string, recipeIds: string[]): Promise<PlanItemRecord[]>;
};
