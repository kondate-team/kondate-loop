import { randomUUID } from "crypto";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DeleteCommand,
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
  QueryCommand,
  ScanCommand,
} from "@aws-sdk/lib-dynamodb";
import type { QueryCommandInput } from "@aws-sdk/lib-dynamodb";
import {
  gsi1Pk,
  gsi1SkOwner,
  gsi2PkCatalog,
  gsi2SkNewest,
  gsi3PkCreator,
  gsi3SkCreated,
  KEY_PREFIX,
  pkUser,
  skFridge,
  skFridgeDeleted,
  skPlan,
  skProfile,
  skRecipe,
  skSet,
  skShopping,
} from "./keys";
import type {
  CreateRecipeInput,
  CreateSetInput,
  DataStore,
  DeletedFridgeItemRecord,
  FridgeItemRecord,
  PlanItemRecord,
  PlanRecord,
  PlanSlotRecord,
  RecipeRecord,
  SetRecord,
  ShoppingItemRecord,
  UserRecord,
} from "./types";

function nowIso(): string {
  return new Date().toISOString();
}

function toPlanItems(recipes: RecipeRecord[], recipeIds: string[]): PlanItemRecord[] {
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

type StoredMeta = {
  PK: string;
  SK: string;
  entityType?: string;
  GSI1PK?: string;
  GSI1SK?: string;
  GSI2PK?: string;
  GSI2SK?: string;
  GSI3PK?: string;
  GSI3SK?: string;
};

type StoredItem<T> = T & StoredMeta;
type DynamoItem = Record<string, unknown> & StoredMeta;

function stripMeta<T>(item: StoredItem<T>): T {
  const {
    PK: _PK,
    SK: _SK,
    entityType: _entityType,
    GSI1PK: _GSI1PK,
    GSI1SK: _GSI1SK,
    GSI2PK: _GSI2PK,
    GSI2SK: _GSI2SK,
    GSI3PK: _GSI3PK,
    GSI3SK: _GSI3SK,
    ...value
  } = item;
  return value as T;
}

export class DynamoDataStore implements DataStore {
  private readonly tableName: string;
  private readonly docClient: DynamoDBDocumentClient;

  constructor(tableName?: string) {
    const resolved = tableName ?? process.env.TABLE_NAME;
    if (!resolved) {
      throw new Error("TABLE_NAME is required when DATA_STORE_DRIVER=dynamo");
    }
    this.tableName = resolved;
    const client = new DynamoDBClient({});
    this.docClient = DynamoDBDocumentClient.from(client, {
      marshallOptions: { removeUndefinedValues: true },
    });
  }

  private async put(item: DynamoItem): Promise<void> {
    await this.docClient.send(
      new PutCommand({
        TableName: this.tableName,
        Item: item,
      })
    );
  }

  private async get<T>(PK: string, SK: string): Promise<StoredItem<T> | null> {
    const response = await this.docClient.send(
      new GetCommand({
        TableName: this.tableName,
        Key: { PK, SK },
      })
    );
    return (response.Item as StoredItem<T> | undefined) ?? null;
  }

  private async delete(PK: string, SK: string): Promise<void> {
    await this.docClient.send(
      new DeleteCommand({
        TableName: this.tableName,
        Key: { PK, SK },
      })
    );
  }

  private async queryByPk<T>(PK: string, skPrefix?: string): Promise<Array<StoredItem<T>>> {
    const params: QueryCommandInput = {
      TableName: this.tableName,
      KeyConditionExpression: "PK = :pk",
      ExpressionAttributeValues: { ":pk": PK },
    };
    if (skPrefix) {
      params.KeyConditionExpression = "PK = :pk AND begins_with(SK, :sk)";
      params.ExpressionAttributeValues = { ":pk": PK, ":sk": skPrefix };
    }

    const response = await this.docClient.send(new QueryCommand(params));
    return (response.Items as Array<StoredItem<T>> | undefined) ?? [];
  }

  private async listPublicEntity<T>(entityType: "RECIPE" | "SET"): Promise<Array<StoredItem<T>>> {
    const items: Array<StoredItem<T>> = [];
    let lastEvaluatedKey: Record<string, unknown> | undefined;

    do {
      const response = await this.docClient.send(
        new ScanCommand({
          TableName: this.tableName,
          FilterExpression: "#entityType = :entityType AND #isPublic = :isPublic",
          ExpressionAttributeNames: {
            "#entityType": "entityType",
            "#isPublic": "isPublic",
          },
          ExpressionAttributeValues: {
            ":entityType": entityType,
            ":isPublic": true,
          },
          ExclusiveStartKey: lastEvaluatedKey,
        })
      );
      items.push(...((response.Items as Array<StoredItem<T>> | undefined) ?? []));
      lastEvaluatedKey = response.LastEvaluatedKey as Record<string, unknown> | undefined;
    } while (lastEvaluatedKey);

    return items;
  }

  private async findPublicEntityById<T>(
    entityType: "RECIPE" | "SET",
    id: string
  ): Promise<StoredItem<T> | null> {
    let lastEvaluatedKey: Record<string, unknown> | undefined;

    do {
      const response = await this.docClient.send(
        new ScanCommand({
          TableName: this.tableName,
          FilterExpression: "#entityType = :entityType AND #isPublic = :isPublic AND #id = :id",
          ExpressionAttributeNames: {
            "#entityType": "entityType",
            "#isPublic": "isPublic",
            "#id": "id",
          },
          ExpressionAttributeValues: {
            ":entityType": entityType,
            ":isPublic": true,
            ":id": id,
          },
          ExclusiveStartKey: lastEvaluatedKey,
        })
      );

      const found = (response.Items as Array<StoredItem<T>> | undefined)?.[0];
      if (found) return found;

      lastEvaluatedKey = response.LastEvaluatedKey as Record<string, unknown> | undefined;
    } while (lastEvaluatedKey);

    return null;
  }

  async upsertUser(userId: string, email: string): Promise<UserRecord> {
    const existing = await this.getUser(userId);
    const next: UserRecord = {
      userId,
      email,
      plan: existing?.plan ?? "free",
      subscriptionStatus: existing?.subscriptionStatus ?? "none",
      stripeCustomerId: existing?.stripeCustomerId,
      stripeDefaultPaymentMethodId: existing?.stripeDefaultPaymentMethodId,
      stripeSubscriptionId: existing?.stripeSubscriptionId,
      stripeConnectAccountId: existing?.stripeConnectAccountId,
      connectOnboardingComplete: existing?.connectOnboardingComplete,
    };

    await this.put({
      PK: pkUser(userId),
      SK: skProfile(),
      entityType: "USER_PROFILE",
      ...next,
    });
    return next;
  }

  async getUser(userId: string): Promise<UserRecord | null> {
    const item = await this.get<UserRecord>(pkUser(userId), skProfile());
    if (!item) return null;
    return stripMeta(item);
  }

  async updateUser(userId: string, patch: Partial<UserRecord>): Promise<UserRecord | null> {
    const existing = await this.getUser(userId);
    if (!existing) return null;
    const next: UserRecord = { ...existing, ...patch };
    await this.put({
      PK: pkUser(userId),
      SK: skProfile(),
      entityType: "USER_PROFILE",
      ...next,
    });
    return next;
  }

  async findUserByCustomerId(customerId: string): Promise<UserRecord | null> {
    const response = await this.docClient.send(
      new ScanCommand({
        TableName: this.tableName,
        FilterExpression: "#entityType = :entityType AND #stripeCustomerId = :customerId",
        ExpressionAttributeNames: {
          "#entityType": "entityType",
          "#stripeCustomerId": "stripeCustomerId",
        },
        ExpressionAttributeValues: {
          ":entityType": "USER_PROFILE",
          ":customerId": customerId,
        },
      })
    );
    const item = (response.Items ?? [])[0] as StoredItem<UserRecord> | undefined;
    if (!item) return null;
    return stripMeta(item);
  }

  async updateUserByCustomerId(
    customerId: string,
    patch: Partial<UserRecord>
  ): Promise<UserRecord | null> {
    const user = await this.findUserByCustomerId(customerId);
    if (!user) return null;
    return this.updateUser(user.userId, patch);
  }

  private toRecipeItem(recipe: RecipeRecord): DynamoItem {
    const isPublic = Boolean(recipe.isPublic);
    return {
      PK: pkUser(recipe.userId),
      SK: skRecipe(recipe.id),
      entityType: "RECIPE",
      GSI1PK: gsi1Pk("RECIPE", recipe.id),
      GSI1SK: gsi1SkOwner(recipe.userId),
      GSI2PK: isPublic ? gsi2PkCatalog("RECIPE") : undefined,
      GSI2SK: isPublic ? gsi2SkNewest(recipe.createdAt, recipe.id) : undefined,
      GSI3PK: isPublic ? gsi3PkCreator(recipe.userId, "RECIPE") : undefined,
      GSI3SK: isPublic ? gsi3SkCreated(recipe.createdAt, recipe.id) : undefined,
      ...recipe,
    };
  }

  async createRecipe(input: CreateRecipeInput): Promise<RecipeRecord> {
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
    await this.put(this.toRecipeItem(recipe));
    return recipe;
  }

  async listRecipes(userId: string): Promise<RecipeRecord[]> {
    const items = await this.queryByPk<RecipeRecord>(pkUser(userId), KEY_PREFIX.RECIPE);
    return items
      .map(stripMeta)
      .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
  }

  async getRecipe(userId: string, recipeId: string): Promise<RecipeRecord | null> {
    const item = await this.get<RecipeRecord>(pkUser(userId), skRecipe(recipeId));
    if (!item) return null;
    return stripMeta(item);
  }

  async updateRecipe(
    userId: string,
    recipeId: string,
    patch: Partial<RecipeRecord>
  ): Promise<RecipeRecord | null> {
    const existing = await this.getRecipe(userId, recipeId);
    if (!existing) return null;
    const next: RecipeRecord = { ...existing, ...patch, updatedAt: nowIso() };
    await this.put(this.toRecipeItem(next));
    return next;
  }

  async deleteRecipe(userId: string, recipeId: string): Promise<boolean> {
    const existing = await this.getRecipe(userId, recipeId);
    if (!existing) return false;
    await this.delete(pkUser(userId), skRecipe(recipeId));
    return true;
  }

  private toSetItem(set: SetRecord): DynamoItem {
    const isPublic = Boolean(set.isPublic);
    return {
      PK: pkUser(set.userId),
      SK: skSet(set.id),
      entityType: "SET",
      GSI1PK: gsi1Pk("SET", set.id),
      GSI1SK: gsi1SkOwner(set.userId),
      GSI2PK: isPublic ? gsi2PkCatalog("SET") : undefined,
      GSI2SK: isPublic ? gsi2SkNewest(set.createdAt, set.id) : undefined,
      GSI3PK: isPublic ? gsi3PkCreator(set.userId, "SET") : undefined,
      GSI3SK: isPublic ? gsi3SkCreated(set.createdAt, set.id) : undefined,
      ...set,
    };
  }

  async createSet(input: CreateSetInput): Promise<SetRecord> {
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
    await this.put(this.toSetItem(set));
    return set;
  }

  async listSets(userId: string): Promise<SetRecord[]> {
    const items = await this.queryByPk<SetRecord>(pkUser(userId), KEY_PREFIX.SET);
    return items
      .map(stripMeta)
      .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
  }

  async getSet(userId: string, setId: string): Promise<SetRecord | null> {
    const item = await this.get<SetRecord>(pkUser(userId), skSet(setId));
    if (!item) return null;
    return stripMeta(item);
  }

  async updateSet(userId: string, setId: string, patch: Partial<SetRecord>): Promise<SetRecord | null> {
    const existing = await this.getSet(userId, setId);
    if (!existing) return null;
    const next: SetRecord = { ...existing, ...patch, updatedAt: nowIso() };
    await this.put(this.toSetItem(next));
    return next;
  }

  async deleteSet(userId: string, setId: string): Promise<boolean> {
    const existing = await this.getSet(userId, setId);
    if (!existing) return false;
    await this.delete(pkUser(userId), skSet(setId));
    return true;
  }

  async listCatalogRecipes(): Promise<RecipeRecord[]> {
    const items = await this.listPublicEntity<RecipeRecord>("RECIPE");
    return items
      .map(stripMeta)
      .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
  }

  async listCatalogSets(): Promise<SetRecord[]> {
    const items = await this.listPublicEntity<SetRecord>("SET");
    return items
      .map(stripMeta)
      .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
  }

  async getCatalogRecipe(recipeId: string): Promise<RecipeRecord | null> {
    const item = await this.findPublicEntityById<RecipeRecord>("RECIPE", recipeId);
    return item ? stripMeta(item) : null;
  }

  async getCatalogSet(setId: string): Promise<SetRecord | null> {
    const item = await this.findPublicEntityById<SetRecord>("SET", setId);
    return item ? stripMeta(item) : null;
  }

  async saveCatalogRecipe(userId: string, recipeId: string): Promise<RecipeRecord | null> {
    const source = await this.getCatalogRecipe(recipeId);
    if (!source) return null;

    const existing = await this.getRecipe(userId, recipeId);
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
    await this.put(this.toRecipeItem(copied));

    await this.updateRecipe(source.userId, source.id, {
      savedCount: (source.savedCount ?? 0) + 1,
    });
    return copied;
  }

  async unsaveCatalogRecipe(userId: string, recipeId: string): Promise<boolean> {
    const existing = await this.getRecipe(userId, recipeId);
    if (!existing || existing.origin !== "saved") return false;
    await this.delete(pkUser(userId), skRecipe(recipeId));

    const source = await this.getCatalogRecipe(recipeId);
    if (source) {
      await this.updateRecipe(source.userId, source.id, {
        savedCount: Math.max(0, (source.savedCount ?? 0) - 1),
      });
    }
    return true;
  }

  async saveCatalogSet(userId: string, setId: string): Promise<SetRecord | null> {
    const source = await this.getCatalogSet(setId);
    if (!source) return null;

    const existing = await this.getSet(userId, setId);
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
    await this.put(this.toSetItem(copied));

    await this.updateSet(source.userId, source.id, {
      savedCount: (source.savedCount ?? 0) + 1,
    });
    return copied;
  }

  async unsaveCatalogSet(userId: string, setId: string): Promise<boolean> {
    const existing = await this.getSet(userId, setId);
    if (!existing || existing.origin !== "saved") return false;
    await this.delete(pkUser(userId), skSet(setId));

    const source = await this.getCatalogSet(setId);
    if (source) {
      await this.updateSet(source.userId, source.id, {
        savedCount: Math.max(0, (source.savedCount ?? 0) - 1),
      });
    }
    return true;
  }

  async getPlan(userId: string): Promise<PlanRecord> {
    const current = await this.get<PlanSlotRecord>(pkUser(userId), skPlan("CURRENT"));
    const next = await this.get<PlanSlotRecord>(pkUser(userId), skPlan("NEXT"));
    return {
      current: current ? stripMeta(current) : null,
      next: next ? stripMeta(next) : null,
    };
  }

  async setPlanSlot(userId: string, slot: "current" | "next", data: PlanSlotRecord): Promise<PlanSlotRecord> {
    await this.put({
      PK: pkUser(userId),
      SK: skPlan(slot === "current" ? "CURRENT" : "NEXT"),
      entityType: "PLAN_SLOT",
      ...data,
    });
    return data;
  }

  async clearPlanSlot(userId: string, slot: "current" | "next"): Promise<void> {
    await this.delete(pkUser(userId), skPlan(slot === "current" ? "CURRENT" : "NEXT"));
  }

  async updatePlanItemCooked(
    userId: string,
    itemId: string,
    isCooked: boolean
  ): Promise<Pick<PlanItemRecord, "id" | "isCooked" | "cookedAt"> | null> {
    const plan = await this.getPlan(userId);
    const cookedAt = isCooked ? nowIso() : null;
    for (const slot of ["current", "next"] as const) {
      const slotData = plan[slot];
      if (!slotData) continue;
      const idx = slotData.items.findIndex((item) => item.id === itemId);
      if (idx === -1) continue;
      slotData.items[idx] = { ...slotData.items[idx], isCooked, cookedAt };
      await this.setPlanSlot(userId, slot, slotData);
      return { id: itemId, isCooked, cookedAt };
    }
    return null;
  }

  async listShoppingItems(userId: string): Promise<ShoppingItemRecord[]> {
    const items = await this.queryByPk<ShoppingItemRecord>(pkUser(userId), KEY_PREFIX.SHOPPING);
    return items.map(stripMeta);
  }

  async createShoppingItem(
    userId: string,
    input: Pick<ShoppingItemRecord, "name" | "quantity" | "unit">
  ): Promise<ShoppingItemRecord> {
    const item: ShoppingItemRecord = {
      id: randomUUID(),
      userId,
      name: input.name,
      quantity: input.quantity,
      unit: input.unit,
      checked: false,
      source: "manual",
    };
    await this.put({
      PK: pkUser(userId),
      SK: skShopping(item.id),
      entityType: "SHOPPING_ITEM",
      ...item,
    });
    return item;
  }

  async updateShoppingItem(
    userId: string,
    itemId: string,
    patch: Partial<ShoppingItemRecord>
  ): Promise<ShoppingItemRecord | null> {
    const existing = await this.get<ShoppingItemRecord>(pkUser(userId), skShopping(itemId));
    if (!existing) return null;
    const next: ShoppingItemRecord = { ...stripMeta(existing), ...patch };
    await this.put({
      PK: pkUser(userId),
      SK: skShopping(itemId),
      entityType: "SHOPPING_ITEM",
      ...next,
    });
    return next;
  }

  async deleteShoppingItem(userId: string, itemId: string): Promise<boolean> {
    const existing = await this.get<ShoppingItemRecord>(pkUser(userId), skShopping(itemId));
    if (!existing) return false;
    await this.delete(pkUser(userId), skShopping(itemId));
    return true;
  }

  async completeShopping(userId: string): Promise<{ movedToFridge: number; remaining: number }> {
    const items = await this.listShoppingItems(userId);
    const checked = items.filter((item) => item.checked);
    for (const item of checked) {
      await this.createFridgeItem(userId, {
        name: item.name,
        quantity: item.quantity,
        unit: item.unit,
        note: null,
      });
      await this.delete(pkUser(userId), skShopping(item.id));
    }
    const remaining = (await this.listShoppingItems(userId)).length;
    return { movedToFridge: checked.length, remaining };
  }

  async listFridgeItems(userId: string): Promise<FridgeItemRecord[]> {
    const items = await this.queryByPk<FridgeItemRecord>(pkUser(userId), KEY_PREFIX.FRIDGE);
    return items
      .filter((item) => !item.SK.startsWith(KEY_PREFIX.FRIDGE_DELETED))
      .map(stripMeta);
  }

  async createFridgeItem(
    userId: string,
    input: Pick<FridgeItemRecord, "name" | "quantity" | "unit" | "note">
  ): Promise<FridgeItemRecord> {
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
    await this.put({
      PK: pkUser(userId),
      SK: skFridge(item.id),
      entityType: "FRIDGE_ITEM",
      ...item,
    });
    return item;
  }

  async updateFridgeItem(
    userId: string,
    itemId: string,
    patch: Partial<FridgeItemRecord>
  ): Promise<FridgeItemRecord | null> {
    const existing = await this.get<FridgeItemRecord>(pkUser(userId), skFridge(itemId));
    if (!existing) return null;
    const next: FridgeItemRecord = {
      ...stripMeta(existing),
      ...patch,
      updatedAt: nowIso(),
    };
    await this.put({
      PK: pkUser(userId),
      SK: skFridge(itemId),
      entityType: "FRIDGE_ITEM",
      ...next,
    });
    return next;
  }

  async deleteFridgeItem(userId: string, itemId: string): Promise<DeletedFridgeItemRecord | null> {
    const existing = await this.get<FridgeItemRecord>(pkUser(userId), skFridge(itemId));
    if (!existing) return null;
    const value = stripMeta(existing);
    await this.delete(pkUser(userId), skFridge(itemId));
    const deletedAt = nowIso();
    const deleted: DeletedFridgeItemRecord = {
      id: value.id,
      userId,
      name: value.name,
      quantity: value.quantity,
      unit: value.unit,
      deletedAt,
    };
    await this.put({
      PK: pkUser(userId),
      SK: skFridgeDeleted(deletedAt, itemId),
      entityType: "FRIDGE_DELETED_ITEM",
      ...deleted,
    });
    return deleted;
  }

  async listDeletedFridgeItems(userId: string): Promise<DeletedFridgeItemRecord[]> {
    const items = await this.queryByPk<DeletedFridgeItemRecord>(pkUser(userId), KEY_PREFIX.FRIDGE_DELETED);
    return items.map(stripMeta);
  }

  async restoreFridgeItem(userId: string, itemId: string): Promise<FridgeItemRecord | null> {
    const deletedItems = await this.listDeletedFridgeItems(userId);
    const target = deletedItems.find((item) => item.id === itemId);
    if (!target) return null;
    const prefix = skFridgeDeleted(target.deletedAt, itemId);
    await this.delete(pkUser(userId), prefix);
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
    await this.put({
      PK: pkUser(userId),
      SK: skFridge(restored.id),
      entityType: "FRIDGE_ITEM",
      ...restored,
    });
    return restored;
  }

  async buildPlanItems(userId: string, recipeIds: string[]): Promise<PlanItemRecord[]> {
    const recipes = await this.listRecipes(userId);
    return toPlanItems(recipes, recipeIds);
  }
}
