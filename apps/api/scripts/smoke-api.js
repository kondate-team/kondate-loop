const { spawn } = require("child_process");
const path = require("path");
const fs = require("fs");
const assert = require("assert");

const apiRoot = path.resolve(__dirname, "..");
const serverEntry = path.join(apiRoot, "dist", "server.js");
const port = Number(process.env.SMOKE_API_PORT || 4342);
const baseUrl = `http://127.0.0.1:${port}`;
const userId = "smoke-user-010";

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function request(method, endpoint, body) {
  const response = await fetch(`${baseUrl}${endpoint}`, {
    method,
    headers: { "content-type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });

  const text = await response.text();
  let json = null;
  if (text) {
    try {
      json = JSON.parse(text);
    } catch {
      json = { raw: text };
    }
  }

  return { status: response.status, json };
}

async function waitForHealth(maxRetry = 30) {
  for (let i = 0; i < maxRetry; i += 1) {
    try {
      const response = await fetch(`${baseUrl}/health`);
      if (response.ok) return;
    } catch {
      // Ignore until server is up.
    }
    await sleep(500);
  }
  throw new Error("API server did not become healthy in time.");
}

async function runSmoke() {
  const smokeEmail = `smoke-user+${Date.now()}@example.com`;
  const smokePassword = "SmokePass123!";

  const authSignup = await request("POST", "/v1/auth/signup", {
    name: "Smoke User",
    email: smokeEmail,
    password: smokePassword,
  });
  assert.strictEqual(authSignup.status, 200, "auth signup failed");
  assert.ok(authSignup.json?.data?.accessToken, "auth signup accessToken not returned");
  assert.ok(authSignup.json?.data?.refreshToken, "auth signup refreshToken not returned");

  const authLogin = await request("POST", "/v1/auth/login", {
    email: smokeEmail,
    password: smokePassword,
  });
  assert.strictEqual(authLogin.status, 200, "auth login failed");
  assert.ok(authLogin.json?.data?.accessToken, "auth login accessToken not returned");
  assert.ok(authLogin.json?.data?.refreshToken, "auth login refreshToken not returned");

  const authCallback = await request("POST", "/v1/auth/callback", {
    userId,
    email: "smoke-user@example.com",
    code: "smoke-oauth-code",
    name: "Smoke User",
  });
  assert.strictEqual(authCallback.status, 200, "auth callback failed");
  assert.ok(authCallback.json?.data?.accessToken, "auth callback accessToken not returned");
  assert.ok(authCallback.json?.data?.refreshToken, "auth callback refreshToken not returned");

  const authRefresh = await request("POST", "/v1/auth/refresh", {
    userId,
    email: "smoke-user@example.com",
    refreshToken: authLogin.json?.data?.refreshToken,
  });
  assert.strictEqual(authRefresh.status, 200, "auth refresh failed");
  assert.ok(authRefresh.json?.data?.accessToken, "auth refresh accessToken not returned");

  const authLogout = await request("POST", "/auth/logout", {
    refreshToken: authLogin.json?.data?.refreshToken,
  });
  assert.strictEqual(authLogout.status, 200, "auth logout failed");
  assert.strictEqual(authLogout.json?.data?.loggedOut, true, "auth logout response is invalid");

  const createRecipe = await request("POST", "/v1/recipes", {
    userId,
    title: "Smoke Recipe",
    servings: 2,
    ingredients: [{ name: "egg", quantity: 2, unit: "pcs" }],
    steps: [{ text: "mix and cook" }],
  });
  assert.strictEqual(createRecipe.status, 201, "create recipe failed");
  const recipeId = createRecipe.json?.data?.id;
  assert.ok(recipeId, "recipe id not returned");

  const listRecipes = await request("GET", `/v1/recipes?userId=${userId}`);
  assert.strictEqual(listRecipes.status, 200, "list recipes failed");
  assert.ok(Array.isArray(listRecipes.json?.data?.items), "recipes list is invalid");

  const getRecipe = await request("GET", `/v1/recipes/${recipeId}?userId=${userId}`);
  assert.strictEqual(getRecipe.status, 200, "get recipe failed");

  const patchRecipe = await request("PATCH", `/v1/recipes/${recipeId}`, {
    userId,
    title: "Smoke Recipe Updated",
  });
  assert.strictEqual(patchRecipe.status, 200, "update recipe failed");
  assert.strictEqual(patchRecipe.json?.data?.title, "Smoke Recipe Updated");

  const createSet = await request("POST", "/v1/sets", {
    userId,
    title: "Smoke Set",
    recipeIds: [recipeId],
  });
  assert.strictEqual(createSet.status, 201, "create set failed");
  const setId = createSet.json?.data?.id;
  assert.ok(setId, "set id not returned");

  const listSets = await request("GET", `/v1/sets?userId=${userId}`);
  assert.strictEqual(listSets.status, 200, "list sets failed");
  assert.ok(Array.isArray(listSets.json?.data?.items), "sets list is invalid");

  const getSet = await request("GET", `/v1/sets/${setId}?userId=${userId}`);
  assert.strictEqual(getSet.status, 200, "get set failed");

  const patchSet = await request("PATCH", `/v1/sets/${setId}`, {
    userId,
    title: "Smoke Set Updated",
  });
  assert.strictEqual(patchSet.status, 200, "update set failed");
  assert.strictEqual(patchSet.json?.data?.title, "Smoke Set Updated");

  const listCategories = await request("GET", `/v1/categories?userId=${userId}&scope=book`);
  assert.strictEqual(listCategories.status, 200, "list categories failed");
  assert.ok(Array.isArray(listCategories.json?.data?.items), "categories list is invalid");

  const createCategory = await request("POST", "/v1/categories", {
    userId,
    scope: "book",
    tagName: "Smoke Category",
  });
  assert.strictEqual(createCategory.status, 201, "create category failed");
  const categoryId = createCategory.json?.data?.id;
  assert.ok(categoryId, "category id not returned");

  const patchCategory = await request("PATCH", `/v1/categories/${categoryId}`, {
    userId,
    isHidden: true,
  });
  assert.strictEqual(patchCategory.status, 200, "update category failed");
  assert.strictEqual(patchCategory.json?.data?.isHidden, true, "category hidden flag not updated");

  const planSelect = await request("POST", "/v1/plan/select-set", {
    userId,
    setId,
    slot: "current",
  });
  assert.strictEqual(planSelect.status, 200, "select plan set failed");
  const planItemId = planSelect.json?.data?.items?.[0]?.id;
  assert.ok(planItemId, "plan item id not returned");

  const cookItem = await request("PATCH", `/v1/plan/items/${planItemId}`, {
    userId,
    isCooked: true,
  });
  assert.strictEqual(cookItem.status, 200, "set plan item cooked failed");
  const cookedAt = cookItem.json?.data?.cookedAt;
  assert.ok(cookedAt, "cookedAt not returned");

  const cookedDate = String(cookedAt).slice(0, 10);
  const cookedMonth = String(cookedAt).slice(0, 7);

  const getArchiveMonth = await request(
    "GET",
    `/v1/archive?userId=${userId}&month=${encodeURIComponent(cookedMonth)}`
  );
  assert.strictEqual(getArchiveMonth.status, 200, "get archive month failed");
  assert.ok(Array.isArray(getArchiveMonth.json?.data?.days), "archive month days is invalid");
  assert.ok((getArchiveMonth.json?.data?.totalCount ?? 0) >= 1, "archive month totalCount is invalid");

  const getArchiveDate = await request(
    "GET",
    `/v1/archive/${encodeURIComponent(cookedDate)}?userId=${userId}`
  );
  assert.strictEqual(getArchiveDate.status, 200, "get archive date failed");
  assert.ok(Array.isArray(getArchiveDate.json?.data?.logs), "archive date logs is invalid");

  const listPaymentMethods = await request("GET", `/v1/payment-methods?userId=${userId}`);
  assert.strictEqual(listPaymentMethods.status, 200, "list payment methods failed");
  assert.ok(Array.isArray(listPaymentMethods.json?.data?.items), "payment methods list is invalid");

  const createPurchase = await request("POST", "/v1/purchases", {
    userId,
    itemType: "recipe",
    itemId: recipeId,
    paymentMethodId: "pm_smoke_offline",
  });
  assert.strictEqual(createPurchase.status, 200, "create purchase failed");
  assert.strictEqual(createPurchase.json?.data?.itemType, "recipe");

  const listPurchases = await request("GET", `/v1/purchases?userId=${userId}`);
  assert.strictEqual(listPurchases.status, 200, "list purchases failed");
  assert.ok(Array.isArray(listPurchases.json?.data?.items), "purchases list is invalid");

  const getSubscription = await request("GET", `/v1/subscriptions?userId=${userId}`);
  assert.strictEqual(getSubscription.status, 200, "get subscription failed");

  const getNotificationSettings = await request("GET", `/v1/notification-settings?userId=${userId}`);
  assert.strictEqual(getNotificationSettings.status, 200, "get notification settings failed");
  assert.strictEqual(typeof getNotificationSettings.json?.data?.pushEnabled, "boolean");

  const patchNotificationSettings = await request("PATCH", "/v1/notification-settings", {
    userId,
    categories: { personal: false },
  });
  assert.strictEqual(patchNotificationSettings.status, 200, "patch notification settings failed");
  assert.strictEqual(patchNotificationSettings.json?.data?.categories?.personal, false);

  const listNotifications = await request("GET", `/v1/notifications?userId=${userId}&type=all&limit=20`);
  assert.strictEqual(listNotifications.status, 200, "list notifications failed");
  assert.ok(Array.isArray(listNotifications.json?.data?.items), "notifications list is invalid");

  const readNotifications = await request("POST", "/v1/notifications/read", {
    userId,
    all: true,
  });
  assert.strictEqual(readNotifications.status, 200, "mark notifications read failed");
  assert.strictEqual(typeof readNotifications.json?.data?.readCount, "number");

  const pushToken = `smoke-push-${Date.now()}`;
  const registerPushToken = await request("POST", "/v1/push-tokens", {
    userId,
    token: pushToken,
    platform: "web",
  });
  assert.strictEqual(registerPushToken.status, 201, "register push token failed");

  const deletePushToken = await request("DELETE", `/v1/push-tokens/${encodeURIComponent(pushToken)}`, {
    userId,
  });
  assert.strictEqual(deletePushToken.status, 200, "delete push token failed");

  const deleteCategory = await request("DELETE", `/v1/categories/${categoryId}`, { userId });
  assert.strictEqual(deleteCategory.status, 200, "delete category failed");

  const deleteSet = await request("DELETE", `/v1/sets/${setId}`, { userId });
  assert.strictEqual(deleteSet.status, 200, "delete set failed");

  const deleteRecipe = await request("DELETE", `/v1/recipes/${recipeId}`, { userId });
  assert.strictEqual(deleteRecipe.status, 200, "delete recipe failed");
}

async function main() {
  if (!fs.existsSync(serverEntry)) {
    throw new Error(`Build output is missing: ${serverEntry}. Run 'npm run build --workspace=apps/api' first.`);
  }

  const env = {
    ...process.env,
    PORT: String(port),
    CORS_ORIGIN: "http://localhost:5173",
    DATA_STORE_DRIVER: process.env.DATA_STORE_DRIVER || "file",
    STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY || "sk_test_dummy",
    STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET || "whsec_dummy",
    STRIPE_PRICE_ID_USER_PLUS: process.env.STRIPE_PRICE_ID_USER_PLUS || "price_dummy_user_plus",
    STRIPE_PRICE_ID_CREATOR_PLUS: process.env.STRIPE_PRICE_ID_CREATOR_PLUS || "price_dummy_creator_plus",
    STRIPE_PRICE_ID_CREATOR: process.env.STRIPE_PRICE_ID_CREATOR || "price_dummy_creator",
  };

  const child = spawn("node", [serverEntry], {
    cwd: apiRoot,
    env,
    stdio: "pipe",
  });

  child.stdout.on("data", (chunk) => process.stdout.write(chunk.toString()));
  child.stderr.on("data", (chunk) => process.stderr.write(chunk.toString()));

  try {
    await waitForHealth();
    await runSmoke();
    console.log("Smoke API test passed.");
  } finally {
    child.kill("SIGTERM");
    await sleep(500);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
