import fs from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";
import type {
  CategoryRecord,
  CategoryScope,
  CookLogRecord,
  CreateRecipeInput,
  CreateSetInput,
  DataStore,
  DeletedFridgeItemRecord,
  FridgeItemRecord,
  NotificationPlatform,
  NotificationRecord,
  NotificationSettingsRecord,
  PlanItemRecord,
  PlanRecord,
  PlanSlotRecord,
  PaymentMethodRecord,
  PurchaseRecord,
  RecipeRecord,
  SetRecord,
  ShoppingItemRecord,
  SubscriptionRecord,
  UserRecord,
} from "./types";

type StoreData = {
  users: Record<string, UserRecord>;
  recipes: Record<string, RecipeRecord>;
  sets: Record<string, SetRecord>;
  categories: Record<string, CategoryRecord>;
  cookLogs: Record<string, CookLogRecord[]>;
  paymentMethods: Record<string, PaymentMethodRecord[]>;
  purchases: Record<string, PurchaseRecord[]>;
  subscriptions: Record<string, SubscriptionRecord>;
  notifications: Record<string, NotificationRecord[]>;
  pushTokens: Record<string, Array<{ token: string; platform: NotificationPlatform; createdAt: string }>>;
  notificationSettings: Record<string, NotificationSettingsRecord>;
  plans: Record<string, PlanRecord>;
  shopping: Record<string, ShoppingItemRecord[]>;
  fridge: Record<string, FridgeItemRecord[]>;
  deletedFridge: Record<string, DeletedFridgeItemRecord[]>;
};

const DEFAULT_PLAN: PlanRecord = { current: null, next: null };

function nowIso(): string {
  return new Date().toISOString();
}

function key(userId: string, id: string): string {
  return `${userId}#${id}`;
}

function buildPlanItemsFromRecipeIds(recipes: RecipeRecord[], recipeIds: string[]): PlanItemRecord[] {
  return recipeIds.map((recipeId) => {
    const recipe = recipes.find((r) => r.id === recipeId);
    return {
      id: randomUUID(),
      recipeId,
      title: recipe?.title ?? recipeId,
      thumbnailUrl: recipe?.thumbnailUrl ?? null,
      isCooked: false,
      cookedAt: null,
    };
  });
}

function defaultNotificationSettings(userId: string): NotificationSettingsRecord {
  return {
    userId,
    pushEnabled: true,
    categories: {
      news: true,
      personal: true,
    },
    updatedAt: nowIso(),
  };
}

export class FileDataStore implements DataStore {
  private readonly storePath: string;

  constructor(storePath?: string) {
    this.storePath = storePath ?? path.join(process.cwd(), "data", "store.json");
  }

  private async readStore(): Promise<StoreData> {
    try {
      const raw = await fs.readFile(this.storePath, "utf8");
      const parsed = JSON.parse(raw) as Partial<StoreData>;
      return {
        users: parsed.users ?? {},
        recipes: parsed.recipes ?? {},
        sets: parsed.sets ?? {},
        categories: parsed.categories ?? {},
        cookLogs: parsed.cookLogs ?? {},
        paymentMethods: parsed.paymentMethods ?? {},
        purchases: parsed.purchases ?? {},
        subscriptions: parsed.subscriptions ?? {},
        notifications: parsed.notifications ?? {},
        pushTokens: parsed.pushTokens ?? {},
        notificationSettings: parsed.notificationSettings ?? {},
        plans: parsed.plans ?? {},
        shopping: parsed.shopping ?? {},
        fridge: parsed.fridge ?? {},
        deletedFridge: parsed.deletedFridge ?? {},
      };
    } catch (e: unknown) {
      const err = e as NodeJS.ErrnoException;
      if (err.code === "ENOENT") {
        const init: StoreData = {
          users: {},
          recipes: {},
          sets: {},
          categories: {},
          cookLogs: {},
          paymentMethods: {},
          purchases: {},
          subscriptions: {},
          notifications: {},
          pushTokens: {},
          notificationSettings: {},
          plans: {},
          shopping: {},
          fridge: {},
          deletedFridge: {},
        };
        await this.writeStore(init);
        return init;
      }
      throw e;
    }
  }

  private async writeStore(store: StoreData): Promise<void> {
    await fs.mkdir(path.dirname(this.storePath), { recursive: true });
    await fs.writeFile(this.storePath, JSON.stringify(store, null, 2), "utf8");
  }

  async upsertUser(userId: string, email: string): Promise<UserRecord> {
    const store = await this.readStore();
    const existing = store.users[userId];
    const now = nowIso();
    const next: UserRecord = {
      userId,
      email,
      name: existing?.name ?? null,
      role: existing?.role ?? "user",
      avatarUrl: existing?.avatarUrl ?? null,
      createdAt: existing?.createdAt ?? now,
      updatedAt: now,
      plan: existing?.plan ?? "free",
      subscriptionStatus: existing?.subscriptionStatus ?? "none",
      stripeCustomerId: existing?.stripeCustomerId,
      stripeDefaultPaymentMethodId: existing?.stripeDefaultPaymentMethodId,
      stripeSubscriptionId: existing?.stripeSubscriptionId,
      stripeConnectAccountId: existing?.stripeConnectAccountId,
      connectOnboardingComplete: existing?.connectOnboardingComplete,
    };
    store.users[userId] = next;
    await this.writeStore(store);
    return next;
  }

  async getUser(userId: string): Promise<UserRecord | null> {
    const store = await this.readStore();
    return store.users[userId] ?? null;
  }

  async updateUser(userId: string, patch: Partial<UserRecord>): Promise<UserRecord | null> {
    const store = await this.readStore();
    const existing = store.users[userId];
    if (!existing) return null;
    const next = { ...existing, ...patch, updatedAt: nowIso() };
    store.users[userId] = next;
    await this.writeStore(store);
    return next;
  }

  async findUserByCustomerId(customerId: string): Promise<UserRecord | null> {
    const store = await this.readStore();
    return Object.values(store.users).find((u) => u.stripeCustomerId === customerId) ?? null;
  }

  async updateUserByCustomerId(
    customerId: string,
    patch: Partial<UserRecord>
  ): Promise<UserRecord | null> {
    const user = await this.findUserByCustomerId(customerId);
    if (!user) return null;
    return this.updateUser(user.userId, patch);
  }

  async createRecipe(input: CreateRecipeInput): Promise<RecipeRecord> {
    const store = await this.readStore();
    const now = nowIso();
    const recipe: RecipeRecord = {
      id: randomUUID(),
      userId: input.userId,
      title: input.title,
      authorName: input.authorName ?? null,
      thumbnailUrl: input.thumbnailUrl ?? null,
      sourceUrl: input.sourceUrl ?? null,
      servings: input.servings,
      cookTimeMinutes: input.cookTimeMinutes ?? null,
      tags: input.tags ?? [],
      ingredients: input.ingredients ?? [],
      steps: input.steps ?? [],
      intermediateMaterials: input.intermediateMaterials ?? [],
      savedCount: input.savedCount ?? 0,
      isSaved: input.isSaved ?? false,
      origin: input.origin ?? "created",
      isPublic: input.isPublic ?? false,
      createdAt: now,
      updatedAt: now,
    };
    store.recipes[key(recipe.userId, recipe.id)] = recipe;
    await this.writeStore(store);
    return recipe;
  }

  async listRecipes(userId: string): Promise<RecipeRecord[]> {
    const store = await this.readStore();
    return Object.values(store.recipes)
      .filter((r) => r.userId === userId)
      .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
  }

  async getRecipe(userId: string, recipeId: string): Promise<RecipeRecord | null> {
    const store = await this.readStore();
    return store.recipes[key(userId, recipeId)] ?? null;
  }

  async updateRecipe(
    userId: string,
    recipeId: string,
    patch: Partial<RecipeRecord>
  ): Promise<RecipeRecord | null> {
    const store = await this.readStore();
    const k = key(userId, recipeId);
    const existing = store.recipes[k];
    if (!existing) return null;
    const next: RecipeRecord = { ...existing, ...patch, updatedAt: nowIso() };
    store.recipes[k] = next;
    await this.writeStore(store);
    return next;
  }

  async deleteRecipe(userId: string, recipeId: string): Promise<boolean> {
    const store = await this.readStore();
    const k = key(userId, recipeId);
    if (!store.recipes[k]) return false;
    delete store.recipes[k];
    await this.writeStore(store);
    return true;
  }

  async createSet(input: CreateSetInput): Promise<SetRecord> {
    const store = await this.readStore();
    const now = nowIso();
    const set: SetRecord = {
      id: randomUUID(),
      userId: input.userId,
      title: input.title,
      authorName: input.authorName ?? null,
      description: input.description ?? null,
      thumbnailUrl: input.thumbnailUrl ?? null,
      tags: input.tags ?? [],
      recipeIds: input.recipeIds,
      savedCount: input.savedCount ?? 0,
      isSaved: input.isSaved ?? false,
      origin: input.origin ?? "created",
      isPublic: input.isPublic ?? false,
      createdAt: now,
      updatedAt: now,
    };
    store.sets[key(set.userId, set.id)] = set;
    await this.writeStore(store);
    return set;
  }

  async listSets(userId: string): Promise<SetRecord[]> {
    const store = await this.readStore();
    return Object.values(store.sets)
      .filter((s) => s.userId === userId)
      .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
  }

  async getSet(userId: string, setId: string): Promise<SetRecord | null> {
    const store = await this.readStore();
    return store.sets[key(userId, setId)] ?? null;
  }

  async updateSet(userId: string, setId: string, patch: Partial<SetRecord>): Promise<SetRecord | null> {
    const store = await this.readStore();
    const k = key(userId, setId);
    const existing = store.sets[k];
    if (!existing) return null;
    const next: SetRecord = { ...existing, ...patch, updatedAt: nowIso() };
    store.sets[k] = next;
    await this.writeStore(store);
    return next;
  }

  async deleteSet(userId: string, setId: string): Promise<boolean> {
    const store = await this.readStore();
    const k = key(userId, setId);
    if (!store.sets[k]) return false;
    delete store.sets[k];
    await this.writeStore(store);
    return true;
  }

  async listCatalogRecipes(): Promise<RecipeRecord[]> {
    const store = await this.readStore();
    return Object.values(store.recipes)
      .filter((recipe) => recipe.isPublic)
      .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
  }

  async listCatalogSets(): Promise<SetRecord[]> {
    const store = await this.readStore();
    return Object.values(store.sets)
      .filter((set) => set.isPublic)
      .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
  }

  async getCatalogRecipe(recipeId: string): Promise<RecipeRecord | null> {
    const store = await this.readStore();
    return (
      Object.values(store.recipes).find((recipe) => recipe.id === recipeId && recipe.isPublic) ?? null
    );
  }

  async getCatalogSet(setId: string): Promise<SetRecord | null> {
    const store = await this.readStore();
    return Object.values(store.sets).find((set) => set.id === setId && set.isPublic) ?? null;
  }

  async saveCatalogRecipe(userId: string, recipeId: string): Promise<RecipeRecord | null> {
    const store = await this.readStore();
    const source = Object.values(store.recipes).find(
      (recipe) => recipe.id === recipeId && recipe.isPublic
    );
    if (!source) return null;

    const ownKey = key(userId, recipeId);
    const existing = store.recipes[ownKey];
    if (existing) return existing;

    const now = nowIso();
    const copied: RecipeRecord = {
      ...source,
      userId,
      origin: "saved",
      isSaved: true,
      isPublic: false,
      createdAt: now,
      updatedAt: now,
    };
    store.recipes[ownKey] = copied;

    const sourceKey = key(source.userId, source.id);
    const sourceCurrent = store.recipes[sourceKey];
    if (sourceCurrent) {
      sourceCurrent.savedCount = (sourceCurrent.savedCount ?? 0) + 1;
      sourceCurrent.updatedAt = now;
      store.recipes[sourceKey] = sourceCurrent;
    }

    await this.writeStore(store);
    return copied;
  }

  async unsaveCatalogRecipe(userId: string, recipeId: string): Promise<boolean> {
    const store = await this.readStore();
    const ownKey = key(userId, recipeId);
    const existing = store.recipes[ownKey];
    if (!existing || existing.origin !== "saved") return false;
    delete store.recipes[ownKey];

    const sourceEntry = Object.entries(store.recipes).find(
      ([entryKey, recipe]) => recipe.id === recipeId && recipe.isPublic && entryKey !== ownKey
    );
    if (sourceEntry) {
      const [sourceKey, sourceRecipe] = sourceEntry;
      sourceRecipe.savedCount = Math.max(0, (sourceRecipe.savedCount ?? 0) - 1);
      sourceRecipe.updatedAt = nowIso();
      store.recipes[sourceKey] = sourceRecipe;
    }

    await this.writeStore(store);
    return true;
  }

  async saveCatalogSet(userId: string, setId: string): Promise<SetRecord | null> {
    const store = await this.readStore();
    const source = Object.values(store.sets).find((set) => set.id === setId && set.isPublic);
    if (!source) return null;

    const ownKey = key(userId, setId);
    const existing = store.sets[ownKey];
    if (existing) return existing;

    const now = nowIso();
    const copied: SetRecord = {
      ...source,
      userId,
      origin: "saved",
      isSaved: true,
      isPublic: false,
      createdAt: now,
      updatedAt: now,
    };
    store.sets[ownKey] = copied;

    const sourceKey = key(source.userId, source.id);
    const sourceCurrent = store.sets[sourceKey];
    if (sourceCurrent) {
      sourceCurrent.savedCount = (sourceCurrent.savedCount ?? 0) + 1;
      sourceCurrent.updatedAt = now;
      store.sets[sourceKey] = sourceCurrent;
    }

    await this.writeStore(store);
    return copied;
  }

  async unsaveCatalogSet(userId: string, setId: string): Promise<boolean> {
    const store = await this.readStore();
    const ownKey = key(userId, setId);
    const existing = store.sets[ownKey];
    if (!existing || existing.origin !== "saved") return false;
    delete store.sets[ownKey];

    const sourceEntry = Object.entries(store.sets).find(
      ([entryKey, set]) => set.id === setId && set.isPublic && entryKey !== ownKey
    );
    if (sourceEntry) {
      const [sourceKey, sourceSet] = sourceEntry;
      sourceSet.savedCount = Math.max(0, (sourceSet.savedCount ?? 0) - 1);
      sourceSet.updatedAt = nowIso();
      store.sets[sourceKey] = sourceSet;
    }

    await this.writeStore(store);
    return true;
  }

  async listCategories(userId: string, scope: CategoryScope): Promise<CategoryRecord[]> {
    const store = await this.readStore();
    return Object.values(store.categories)
      .filter((category) => category.userId === userId && category.scope === scope)
      .sort((a, b) => a.order - b.order);
  }

  async createCategory(userId: string, scope: CategoryScope, tagName: string): Promise<CategoryRecord> {
    const store = await this.readStore();
    const existing = Object.values(store.categories).filter(
      (category) => category.userId === userId && category.scope === scope
    );
    const maxOrder = existing.length ? Math.max(...existing.map((category) => category.order)) : 1;
    const now = nowIso();
    const category: CategoryRecord = {
      id: randomUUID(),
      userId,
      scope,
      tagName,
      order: maxOrder + 1,
      isDefault: false,
      isHidden: false,
      colorTheme: null,
      createdAt: now,
      updatedAt: now,
    };
    store.categories[key(userId, category.id)] = category;
    await this.writeStore(store);
    return category;
  }

  async updateCategory(
    userId: string,
    categoryId: string,
    patch: Partial<Pick<CategoryRecord, "tagName" | "order" | "isHidden">>
  ): Promise<CategoryRecord | null> {
    const store = await this.readStore();
    const categoryKey = Object.entries(store.categories).find(
      ([entryKey, value]) => entryKey.startsWith(`${userId}#`) && value.id === categoryId
    )?.[0];
    if (!categoryKey) return null;
    const existing = store.categories[categoryKey];
    const updated: CategoryRecord = {
      ...existing,
      ...patch,
      updatedAt: nowIso(),
    };
    store.categories[categoryKey] = updated;
    await this.writeStore(store);
    return updated;
  }

  async deleteCategory(userId: string, categoryId: string): Promise<boolean> {
    const store = await this.readStore();
    const categoryKey = Object.entries(store.categories).find(
      ([entryKey, value]) => entryKey.startsWith(`${userId}#`) && value.id === categoryId
    )?.[0];
    if (!categoryKey) return false;
    delete store.categories[categoryKey];
    await this.writeStore(store);
    return true;
  }

  async listCookLogsByMonth(userId: string, month: string): Promise<CookLogRecord[]> {
    const store = await this.readStore();
    return (store.cookLogs[userId] ?? [])
      .filter((log) => log.createdAt.startsWith(month))
      .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
  }

  async listCookLogsByDate(userId: string, date: string): Promise<CookLogRecord[]> {
    const store = await this.readStore();
    return (store.cookLogs[userId] ?? [])
      .filter((log) => log.createdAt.startsWith(date))
      .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
  }

  async upsertPaymentMethod(
    userId: string,
    method: Omit<PaymentMethodRecord, "userId" | "createdAt" | "updatedAt">
  ): Promise<PaymentMethodRecord> {
    const store = await this.readStore();
    const current = store.paymentMethods[userId] ?? [];
    const now = nowIso();
    const next: PaymentMethodRecord = {
      userId,
      id: method.id,
      brand: method.brand,
      last4: method.last4,
      expMonth: method.expMonth,
      expYear: method.expYear,
      isDefault: method.isDefault,
      createdAt: current.find((item) => item.id === method.id)?.createdAt ?? now,
      updatedAt: now,
    };
    let merged = current.filter((item) => item.id !== method.id);
    merged.push(next);
    if (next.isDefault) {
      merged = merged.map((item) => ({ ...item, isDefault: item.id === next.id }));
    }
    store.paymentMethods[userId] = merged.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
    await this.writeStore(store);
    return next;
  }

  async listPaymentMethods(userId: string): Promise<PaymentMethodRecord[]> {
    const store = await this.readStore();
    return store.paymentMethods[userId] ?? [];
  }

  async deletePaymentMethod(userId: string, paymentMethodId: string): Promise<boolean> {
    const store = await this.readStore();
    const current = store.paymentMethods[userId] ?? [];
    const next = current.filter((item) => item.id !== paymentMethodId);
    if (next.length === current.length) return false;
    if (!next.some((item) => item.isDefault) && next.length > 0) {
      next[0].isDefault = true;
    }
    store.paymentMethods[userId] = next;
    await this.writeStore(store);
    return true;
  }

  async createPurchase(
    userId: string,
    input: Omit<PurchaseRecord, "userId" | "purchaseId" | "purchasedAt">
  ): Promise<PurchaseRecord> {
    const store = await this.readStore();
    const purchase: PurchaseRecord = {
      purchaseId: randomUUID(),
      userId,
      itemType: input.itemType,
      itemId: input.itemId,
      itemTitle: input.itemTitle,
      amount: input.amount,
      currency: "JPY",
      status: input.status,
      purchasedAt: nowIso(),
    };
    store.purchases[userId] = [purchase, ...(store.purchases[userId] ?? [])];
    await this.writeStore(store);
    return purchase;
  }

  async listPurchases(userId: string): Promise<PurchaseRecord[]> {
    const store = await this.readStore();
    return store.purchases[userId] ?? [];
  }

  async upsertSubscription(
    userId: string,
    input: Omit<SubscriptionRecord, "userId" | "updatedAt">
  ): Promise<SubscriptionRecord> {
    const store = await this.readStore();
    const subscription: SubscriptionRecord = {
      subscriptionId: input.subscriptionId,
      userId,
      planId: input.planId,
      status: input.status,
      currentPeriodEnd: input.currentPeriodEnd,
      updatedAt: nowIso(),
    };
    store.subscriptions[userId] = subscription;
    await this.writeStore(store);
    return subscription;
  }

  async getSubscription(userId: string): Promise<SubscriptionRecord | null> {
    const store = await this.readStore();
    return store.subscriptions[userId] ?? null;
  }

  async deleteSubscription(userId: string): Promise<boolean> {
    const store = await this.readStore();
    if (!store.subscriptions[userId]) return false;
    delete store.subscriptions[userId];
    await this.writeStore(store);
    return true;
  }

  async listNotifications(userId: string): Promise<NotificationRecord[]> {
    const store = await this.readStore();
    return store.notifications[userId] ?? [];
  }

  async markNotificationsRead(
    userId: string,
    input: { notificationIds?: string[]; all?: boolean }
  ): Promise<{ readCount: number; unreadCount: number }> {
    const store = await this.readStore();
    const list = store.notifications[userId] ?? [];
    let readCount = 0;
    const targetIds = new Set(input.notificationIds ?? []);

    for (const item of list) {
      const shouldRead = input.all === true || targetIds.has(item.id);
      if (shouldRead && !item.isRead) {
        item.isRead = true;
        readCount += 1;
      }
    }
    store.notifications[userId] = list;
    await this.writeStore(store);
    const unreadCount = list.filter((item) => !item.isRead).length;
    return { readCount, unreadCount };
  }

  async upsertPushToken(userId: string, token: string, platform: NotificationPlatform): Promise<boolean> {
    const store = await this.readStore();
    const current = store.pushTokens[userId] ?? [];
    const exists = current.some((item) => item.token === token);
    if (!exists) {
      current.push({ token, platform, createdAt: nowIso() });
      store.pushTokens[userId] = current;
      await this.writeStore(store);
    }
    return !exists;
  }

  async deletePushToken(userId: string, token: string): Promise<boolean> {
    const store = await this.readStore();
    const current = store.pushTokens[userId] ?? [];
    const next = current.filter((item) => item.token !== token);
    if (next.length === current.length) return false;
    store.pushTokens[userId] = next;
    await this.writeStore(store);
    return true;
  }

  async getNotificationSettings(userId: string): Promise<NotificationSettingsRecord> {
    const store = await this.readStore();
    return store.notificationSettings[userId] ?? defaultNotificationSettings(userId);
  }

  async updateNotificationSettings(
    userId: string,
    patch: { pushEnabled?: boolean; categories?: Partial<NotificationSettingsRecord["categories"]> }
  ): Promise<NotificationSettingsRecord> {
    const store = await this.readStore();
    const existing = store.notificationSettings[userId] ?? defaultNotificationSettings(userId);
    const next: NotificationSettingsRecord = {
      ...existing,
      ...patch,
      categories: patch.categories ? { ...existing.categories, ...patch.categories } : existing.categories,
      updatedAt: nowIso(),
    };
    store.notificationSettings[userId] = next;
    await this.writeStore(store);
    return next;
  }

  async getPlan(userId: string): Promise<PlanRecord> {
    const store = await this.readStore();
    return store.plans[userId] ?? { ...DEFAULT_PLAN };
  }

  async setPlanSlot(userId: string, slot: "current" | "next", data: PlanSlotRecord): Promise<PlanSlotRecord> {
    const store = await this.readStore();
    const existing = store.plans[userId] ?? { ...DEFAULT_PLAN };
    const next = {
      ...existing,
      [slot]: data,
    };
    store.plans[userId] = next;
    await this.writeStore(store);
    return data;
  }

  async clearPlanSlot(userId: string, slot: "current" | "next"): Promise<void> {
    const store = await this.readStore();
    const existing = store.plans[userId] ?? { ...DEFAULT_PLAN };
    store.plans[userId] = {
      ...existing,
      [slot]: null,
    };
    await this.writeStore(store);
  }

  async updatePlanItemCooked(
    userId: string,
    itemId: string,
    isCooked: boolean
  ): Promise<Pick<PlanItemRecord, "id" | "isCooked" | "cookedAt"> | null> {
    const store = await this.readStore();
    const plan = store.plans[userId];
    if (!plan) return null;

    const cookedAt = isCooked ? nowIso() : null;
    for (const slot of ["current", "next"] as const) {
      const slotData = plan[slot];
      if (!slotData) continue;
      const idx = slotData.items.findIndex((item) => item.id === itemId);
      if (idx === -1) continue;
      const previousItem = slotData.items[idx];
      slotData.items[idx] = {
        ...previousItem,
        isCooked,
        cookedAt,
      };
      if (!previousItem.isCooked && isCooked && cookedAt) {
        const log: CookLogRecord = {
          id: randomUUID(),
          userId,
          recipeId: previousItem.recipeId,
          recipeTitle: previousItem.title,
          recipeThumbnailUrl: previousItem.thumbnailUrl,
          createdAt: cookedAt,
        };
        store.cookLogs[userId] = [...(store.cookLogs[userId] ?? []), log];
      }
      store.plans[userId] = plan;
      await this.writeStore(store);
      return { id: itemId, isCooked, cookedAt };
    }
    return null;
  }

  async listShoppingItems(userId: string): Promise<ShoppingItemRecord[]> {
    const store = await this.readStore();
    return store.shopping[userId] ?? [];
  }

  async createShoppingItem(
    userId: string,
    input: Pick<ShoppingItemRecord, "name" | "quantity" | "unit">
  ): Promise<ShoppingItemRecord> {
    const store = await this.readStore();
    const item: ShoppingItemRecord = {
      id: randomUUID(),
      userId,
      name: input.name,
      quantity: input.quantity,
      unit: input.unit,
      checked: false,
      source: "manual",
    };
    store.shopping[userId] = [...(store.shopping[userId] ?? []), item];
    await this.writeStore(store);
    return item;
  }

  async updateShoppingItem(
    userId: string,
    itemId: string,
    patch: Partial<ShoppingItemRecord>
  ): Promise<ShoppingItemRecord | null> {
    const store = await this.readStore();
    const list = store.shopping[userId] ?? [];
    const idx = list.findIndex((item) => item.id === itemId);
    if (idx === -1) return null;
    const next = { ...list[idx], ...patch };
    list[idx] = next;
    store.shopping[userId] = list;
    await this.writeStore(store);
    return next;
  }

  async deleteShoppingItem(userId: string, itemId: string): Promise<boolean> {
    const store = await this.readStore();
    const list = store.shopping[userId] ?? [];
    const next = list.filter((item) => item.id !== itemId);
    if (next.length === list.length) return false;
    store.shopping[userId] = next;
    await this.writeStore(store);
    return true;
  }

  async completeShopping(userId: string): Promise<{ movedToFridge: number; remaining: number }> {
    const store = await this.readStore();
    const items = store.shopping[userId] ?? [];
    const checked = items.filter((item) => item.checked);
    const remaining = items.filter((item) => !item.checked);
    const currentFridge = store.fridge[userId] ?? [];
    const now = nowIso();

    const moved = checked.map<FridgeItemRecord>((item) => ({
      id: randomUUID(),
      userId,
      name: item.name,
      quantity: item.quantity,
      unit: item.unit,
      note: null,
      source: "auto",
      updatedAt: now,
    }));

    store.fridge[userId] = [...currentFridge, ...moved];
    store.shopping[userId] = remaining;
    await this.writeStore(store);

    return { movedToFridge: moved.length, remaining: remaining.length };
  }

  async listFridgeItems(userId: string): Promise<FridgeItemRecord[]> {
    const store = await this.readStore();
    return store.fridge[userId] ?? [];
  }

  async createFridgeItem(
    userId: string,
    input: Pick<FridgeItemRecord, "name" | "quantity" | "unit" | "note">
  ): Promise<FridgeItemRecord> {
    const store = await this.readStore();
    const item: FridgeItemRecord = {
      id: randomUUID(),
      userId,
      name: input.name,
      quantity: input.quantity,
      unit: input.unit,
      note: input.note ?? null,
      source: "manual",
      updatedAt: nowIso(),
    };
    store.fridge[userId] = [...(store.fridge[userId] ?? []), item];
    await this.writeStore(store);
    return item;
  }

  async updateFridgeItem(
    userId: string,
    itemId: string,
    patch: Partial<FridgeItemRecord>
  ): Promise<FridgeItemRecord | null> {
    const store = await this.readStore();
    const list = store.fridge[userId] ?? [];
    const idx = list.findIndex((item) => item.id === itemId);
    if (idx === -1) return null;
    const next: FridgeItemRecord = {
      ...list[idx],
      ...patch,
      updatedAt: nowIso(),
    };
    list[idx] = next;
    store.fridge[userId] = list;
    await this.writeStore(store);
    return next;
  }

  async deleteFridgeItem(userId: string, itemId: string): Promise<DeletedFridgeItemRecord | null> {
    const store = await this.readStore();
    const list = store.fridge[userId] ?? [];
    const idx = list.findIndex((item) => item.id === itemId);
    if (idx === -1) return null;
    const item = list[idx];
    list.splice(idx, 1);
    store.fridge[userId] = list;
    const deleted: DeletedFridgeItemRecord = {
      id: item.id,
      userId,
      name: item.name,
      quantity: item.quantity,
      unit: item.unit,
      deletedAt: nowIso(),
    };
    store.deletedFridge[userId] = [...(store.deletedFridge[userId] ?? []), deleted];
    await this.writeStore(store);
    return deleted;
  }

  async listDeletedFridgeItems(userId: string): Promise<DeletedFridgeItemRecord[]> {
    const store = await this.readStore();
    return store.deletedFridge[userId] ?? [];
  }

  async restoreFridgeItem(userId: string, itemId: string): Promise<FridgeItemRecord | null> {
    const store = await this.readStore();
    const deleted = store.deletedFridge[userId] ?? [];
    const idx = deleted.findIndex((item) => item.id === itemId);
    if (idx === -1) return null;
    const target = deleted[idx];
    deleted.splice(idx, 1);
    store.deletedFridge[userId] = deleted;

    const restored: FridgeItemRecord = {
      id: target.id,
      userId,
      name: target.name,
      quantity: target.quantity,
      unit: target.unit,
      note: null,
      source: "manual",
      updatedAt: nowIso(),
    };
    store.fridge[userId] = [...(store.fridge[userId] ?? []), restored];
    await this.writeStore(store);
    return restored;
  }

  // Utility for plan generation used by API layer.
  async buildPlanItems(userId: string, recipeIds: string[]): Promise<PlanItemRecord[]> {
    const recipes = await this.listRecipes(userId);
    return buildPlanItemsFromRecipeIds(recipes, recipeIds);
  }
}
