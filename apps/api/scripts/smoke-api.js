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
