export type PlanType = "free" | "user_plus" | "creator_plus" | "creator";

export type UserRecord = {
  userId: string;
  email: string;
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
