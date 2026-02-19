export const KEY_PREFIX = {
  USER: "USER#",
  PROFILE: "PROFILE#",
  RECIPE: "RECIPE#",
  SET: "SET#",
  PLAN: "PLAN#",
  SHOPPING: "SHOPPING#",
  FRIDGE: "FRIDGE#",
  FRIDGE_DELETED: "FRIDGE_DELETED#",
  CATEGORY: "CATEGORY#",
  PAYMENT_METHOD: "PAYMENT_METHOD#",
  PURCHASE: "PURCHASE#",
  SUBSCRIPTION: "SUBSCRIPTION#",
  NOTIFICATION: "NOTIFICATION#",
  PUSH_TOKEN: "PUSH_TOKEN#",
  NOTIFICATION_SETTINGS: "NOTIFICATION_SETTINGS#",
  COOKLOG: "COOKLOG#",
  SAVED_RECIPE: "SAVED#RECIPE#",
  SAVED_SET: "SAVED#SET#",
  CATALOG_RECIPE: "CATALOG#RECIPE",
  CATALOG_SET: "CATALOG#SET",
  CREATOR: "CREATOR#",
  SHARE: "SHARE#",
} as const;

export const GSI = {
  BY_ENTITY: "GSI1",
  CATALOG: "GSI2",
  BY_CREATOR: "GSI3",
} as const;

export function pkUser(userId: string): string {
  return `${KEY_PREFIX.USER}${userId}`;
}

export function skProfile(): string {
  return KEY_PREFIX.PROFILE;
}

export function skRecipe(recipeId: string): string {
  return `${KEY_PREFIX.RECIPE}${recipeId}`;
}

export function skSet(setId: string): string {
  return `${KEY_PREFIX.SET}${setId}`;
}

export function skPlan(slot: "CURRENT" | "NEXT"): string {
  return `${KEY_PREFIX.PLAN}${slot}`;
}

export function skShopping(itemId: string): string {
  return `${KEY_PREFIX.SHOPPING}${itemId}`;
}

export function skFridge(itemId: string): string {
  return `${KEY_PREFIX.FRIDGE}${itemId}`;
}

export function skFridgeDeleted(deletedAt: string, itemId: string): string {
  return `${KEY_PREFIX.FRIDGE_DELETED}${deletedAt}#${itemId}`;
}

export function skCategory(scope: "book" | "catalog", categoryId: string): string {
  return `${KEY_PREFIX.CATEGORY}${scope}#${categoryId}`;
}

export function skCookLog(createdAt: string, cookLogId: string): string {
  return `${KEY_PREFIX.COOKLOG}${createdAt}#${cookLogId}`;
}

export function skPaymentMethod(paymentMethodId: string): string {
  return `${KEY_PREFIX.PAYMENT_METHOD}${paymentMethodId}`;
}

export function skPurchase(purchasedAt: string, purchaseId: string): string {
  return `${KEY_PREFIX.PURCHASE}${purchasedAt}#${purchaseId}`;
}

export function skSubscription(): string {
  return KEY_PREFIX.SUBSCRIPTION;
}

export function skNotification(createdAt: string, notificationId: string): string {
  return `${KEY_PREFIX.NOTIFICATION}${createdAt}#${notificationId}`;
}

export function skPushToken(token: string): string {
  return `${KEY_PREFIX.PUSH_TOKEN}${token}`;
}

export function skNotificationSettings(): string {
  return KEY_PREFIX.NOTIFICATION_SETTINGS;
}

export function gsi1Pk(entityType: string, id: string): string {
  return `ENTITY#${entityType}#${id}`;
}

export function gsi1SkOwner(userId: string): string {
  return `OWNER#${userId}`;
}

export function gsi1SkPublic(): string {
  return "PUBLIC#";
}

export function gsi2PkCatalog(entityType: "RECIPE" | "SET"): string {
  return `CATALOG#${entityType}`;
}

export function gsi2SkNewest(createdAt: string, id: string): string {
  return `SORT#NEWEST#${createdAt}#${id}`;
}

export function gsi2SkPopular(score: number, id: string): string {
  return `SORT#POPULAR#${String(score).padStart(10, "0")}#${id}`;
}

export function gsi3PkCreator(
  creatorId: string,
  entityType: "RECIPE" | "SET"
): string {
  return `CREATOR#${creatorId}#${entityType}`;
}

export function gsi3SkCreated(createdAt: string, id: string): string {
  return `CREATED#${createdAt}#${id}`;
}
