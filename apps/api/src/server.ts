import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import Stripe from "stripe";
import { createDataStore } from "./db/storeFactory";
import type { PlanType } from "./db/types";

dotenv.config();

const PORT = Number(process.env.PORT ?? 4242);
const CORS_ORIGIN = process.env.CORS_ORIGIN ?? "http://localhost:5173";

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY ?? "sk_test_dummy";
if (!process.env.STRIPE_SECRET_KEY) {
  console.warn("STRIPE_SECRET_KEY is not set. Stripe endpoints will fail until configured.");
}

const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET ?? "";
const STRIPE_PRICE_ID_USER_PLUS = process.env.STRIPE_PRICE_ID_USER_PLUS ?? "";
const STRIPE_PRICE_ID_CREATOR_PLUS = process.env.STRIPE_PRICE_ID_CREATOR_PLUS ?? "";
const STRIPE_PRICE_ID_CREATOR = process.env.STRIPE_PRICE_ID_CREATOR ?? "";
const PLATFORM_FEE_PERCENT = Number(process.env.PLATFORM_FEE_PERCENT ?? 10);

const stripe = new Stripe(STRIPE_SECRET_KEY);
const store = createDataStore();
export const app = express();

function nowIso(): string {
  return new Date().toISOString();
}

function resolveUserId(req: express.Request): string {
  const bodyUserId = typeof req.body?.userId === "string" ? req.body.userId : "";
  const queryUserId = typeof req.query?.userId === "string" ? req.query.userId : "";
  const headerUserId = typeof req.headers["x-user-id"] === "string" ? req.headers["x-user-id"] : "";
  return bodyUserId || queryUserId || headerUserId || "demo-user";
}

app.post(
  "/webhooks/stripe",
  express.raw({ type: "application/json" }),
  async (req, res) => {
    try {
      const sig = req.headers["stripe-signature"];
      if (!sig || typeof sig !== "string") {
        return res.status(400).send("Missing Stripe-Signature header");
      }
      if (!STRIPE_WEBHOOK_SECRET) {
        const event = JSON.parse(req.body.toString());
        await handleWebhookEvent(event);
        return res.json({ received: true });
      }

      const event = stripe.webhooks.constructEvent(req.body, sig, STRIPE_WEBHOOK_SECRET);
      await handleWebhookEvent(event);
      return res.json({ received: true });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "unknown";
      return res.status(400).send(`Webhook Error: ${message}`);
    }
  }
);

async function handleWebhookEvent(event: Stripe.Event) {
  switch (event.type) {
    case "invoice.paid": {
      const invoice = event.data.object as Stripe.Invoice;
      const subId = invoice.subscription as string | null;
      let plan: PlanType = "user_plus";
      if (subId) {
        const sub = await stripe.subscriptions.retrieve(subId);
        plan = (sub.metadata?.plan as PlanType) || "user_plus";
      }
      await store.updateUserByCustomerId(invoice.customer as string, {
        plan,
        subscriptionStatus: "active",
      });
      break;
    }

    case "invoice.payment_failed": {
      const invoice = event.data.object as Stripe.Invoice;
      await store.updateUserByCustomerId(invoice.customer as string, {
        subscriptionStatus: "past_due",
      });
      break;
    }

    case "customer.subscription.deleted": {
      const sub = event.data.object as Stripe.Subscription;
      await store.updateUserByCustomerId(sub.customer as string, {
        subscriptionStatus: "canceled",
        plan: "free",
      });
      break;
    }

    case "customer.subscription.updated": {
      const sub = event.data.object as Stripe.Subscription;
      await store.updateUserByCustomerId(sub.customer as string, {
        subscriptionStatus: sub.status ?? "unknown",
      });
      break;
    }

    case "account.updated": {
      const account = event.data.object as Stripe.Account;
      const userId = account.metadata?.userId;
      if (userId) {
        await store.updateUser(userId, {
          connectOnboardingComplete: account.payouts_enabled ?? false,
        });
      }
      break;
    }

    default:
      break;
  }
}

app.use(cors({ origin: CORS_ORIGIN, credentials: true }));
app.use(express.json());

app.get("/health", (_req, res) => res.json({ ok: true }));

// payment / subscription / connect
app.post("/v1/payment-methods", async (req, res) => {
  try {
    const { userId, email, paymentMethodId } = req.body ?? {};
    if (!userId || !email || !paymentMethodId) {
      return res.status(400).json({
        error: "Missing fields. Required: { userId, email, paymentMethodId }",
      });
    }

    const user = await store.upsertUser(userId, email);
    let customerId = user.stripeCustomerId;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email,
        metadata: { userId },
      });
      customerId = customer.id;
    }

    await stripe.paymentMethods.attach(paymentMethodId, { customer: customerId });
    await stripe.customers.update(customerId, {
      invoice_settings: { default_payment_method: paymentMethodId },
    });

    await store.updateUser(userId, {
      stripeCustomerId: customerId,
      stripeDefaultPaymentMethodId: paymentMethodId,
    });

    const pm = await stripe.paymentMethods.retrieve(paymentMethodId);
    return res.json({
      ok: true,
      customerId,
      paymentMethodId,
      card: pm.card
        ? {
            brand: pm.card.brand,
            last4: pm.card.last4,
            exp_month: pm.card.exp_month,
            exp_year: pm.card.exp_year,
          }
        : null,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "unknown error";
    return res.status(400).json({ error: message });
  }
});

app.post("/v1/subscriptions", async (req, res) => {
  try {
    const { userId, priceId } = req.body ?? {};
    if (!userId) return res.status(400).json({ error: "Missing userId" });

    const user = await store.getUser(userId);
    if (!user?.stripeCustomerId) {
      return res.status(400).json({
        error: "User not found or stripeCustomerId missing. Call POST /v1/payment-methods first.",
      });
    }

    const usePriceId = priceId || STRIPE_PRICE_ID_USER_PLUS;
    if (!usePriceId) {
      return res.status(400).json({
        error: "Missing priceId. Provide in body or set STRIPE_PRICE_ID_USER_PLUS in .env",
      });
    }

    let planType: PlanType = "user_plus";
    if (usePriceId === STRIPE_PRICE_ID_CREATOR_PLUS) {
      planType = "creator_plus";
    } else if (usePriceId === STRIPE_PRICE_ID_USER_PLUS) {
      planType = "user_plus";
    }

    const subscription = await stripe.subscriptions.create({
      customer: user.stripeCustomerId,
      items: [{ price: usePriceId }],
      payment_behavior: "default_incomplete",
      payment_settings: { save_default_payment_method: "on_subscription" },
      expand: ["latest_invoice.payment_intent", "latest_invoice.confirmation_secret"],
      metadata: { userId, plan: planType },
    });

    let clientSecret: string | null = null;
    const latestInvoice = subscription.latest_invoice as Stripe.Invoice & {
      confirmation_secret?: { client_secret?: string };
      payment_intent?: Stripe.PaymentIntent;
    };
    if (latestInvoice?.confirmation_secret?.client_secret) {
      clientSecret = latestInvoice.confirmation_secret.client_secret;
    } else if (latestInvoice?.payment_intent?.client_secret) {
      clientSecret = latestInvoice.payment_intent.client_secret;
    }

    await store.updateUser(userId, {
      stripeSubscriptionId: subscription.id,
      plan: planType,
      subscriptionStatus: subscription.status ?? "unknown",
    });

    return res.json({
      ok: true,
      subscriptionId: subscription.id,
      status: subscription.status,
      clientSecret,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "unknown error";
    return res.status(400).json({ error: message });
  }
});

app.delete("/v1/subscriptions", async (req, res) => {
  try {
    const { userId } = req.body ?? {};
    if (!userId) return res.status(400).json({ error: "Missing userId" });

    const user = await store.getUser(userId);
    if (!user?.stripeSubscriptionId) {
      return res.status(400).json({ error: "No subscription to cancel" });
    }

    const updated = await stripe.subscriptions.update(user.stripeSubscriptionId, {
      cancel_at_period_end: true,
    });

    await store.updateUser(userId, {
      subscriptionStatus: updated.status ?? "unknown",
    });

    return res.json({ ok: true, subscription: updated });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "unknown error";
    return res.status(400).json({ error: message });
  }
});

app.post("/v1/purchases/plan", async (req, res) => {
  try {
    const { userId, planId } = req.body ?? {};
    if (!userId) return res.status(400).json({ error: "Missing userId" });

    const user = await store.getUser(userId);
    if (!user?.stripeCustomerId) {
      return res.status(400).json({
        error: "User not found or stripeCustomerId missing. Call POST /v1/payment-methods first.",
      });
    }
    if (planId !== "creator") {
      return res.status(400).json({ error: "Only 'creator' plan is supported for one-time purchase" });
    }
    if (!STRIPE_PRICE_ID_CREATOR) {
      return res.status(500).json({ error: "STRIPE_PRICE_ID_CREATOR not configured" });
    }
    if (user.plan === "creator" || user.plan === "creator_plus") {
      return res.status(400).json({ error: "User already has creator plan" });
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: 1200,
      currency: "jpy",
      customer: user.stripeCustomerId,
      payment_method: user.stripeDefaultPaymentMethodId,
      confirm: true,
      automatic_payment_methods: {
        enabled: true,
        allow_redirects: "never",
      },
      metadata: { userId, planId: "creator" },
    });

    if (paymentIntent.status === "succeeded") {
      await store.updateUser(userId, { plan: "creator" });
      return res.json({
        ok: true,
        status: "succeeded",
        paymentIntentId: paymentIntent.id,
        plan: "creator",
      });
    }

    return res.json({
      ok: false,
      status: paymentIntent.status,
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "unknown error";
    return res.status(400).json({ error: message });
  }
});

app.post("/v1/connect/accounts", async (req, res) => {
  try {
    const { userId, email } = req.body ?? {};
    if (!userId || !email) {
      return res.status(400).json({ error: "Missing userId or email" });
    }

    const user = await store.getUser(userId);
    if (user?.stripeConnectAccountId) {
      const account = await stripe.accounts.retrieve(user.stripeConnectAccountId);
      return res.json({
        ok: true,
        accountId: account.id,
        chargesEnabled: account.charges_enabled,
        payoutsEnabled: account.payouts_enabled,
        detailsSubmitted: account.details_submitted,
      });
    }

    const account = await stripe.accounts.create({
      type: "express",
      country: "JP",
      email,
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true },
      },
      business_type: "individual",
      metadata: { userId },
    });

    await store.upsertUser(userId, email);
    await store.updateUser(userId, { stripeConnectAccountId: account.id });

    return res.json({
      ok: true,
      accountId: account.id,
      chargesEnabled: account.charges_enabled,
      payoutsEnabled: account.payouts_enabled,
      detailsSubmitted: account.details_submitted,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "unknown error";
    return res.status(400).json({ error: message });
  }
});

app.post("/v1/connect/account-links", async (req, res) => {
  try {
    const { userId, returnUrl, refreshUrl } = req.body ?? {};
    if (!userId) return res.status(400).json({ error: "Missing userId" });

    const user = await store.getUser(userId);
    if (!user?.stripeConnectAccountId) {
      return res.status(400).json({ error: "Connect account not found. Create one first." });
    }

    const accountLink = await stripe.accountLinks.create({
      account: user.stripeConnectAccountId,
      refresh_url: refreshUrl || "http://localhost:5173/creator/onboarding/refresh",
      return_url: returnUrl || "http://localhost:5173/creator/onboarding/complete",
      type: "account_onboarding",
    });

    return res.json({ ok: true, url: accountLink.url, expiresAt: accountLink.expires_at });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "unknown error";
    return res.status(400).json({ error: message });
  }
});

app.get("/v1/connect/accounts/:userId", async (req, res) => {
  try {
    const user = await store.getUser(req.params.userId);
    if (!user?.stripeConnectAccountId) {
      return res.status(404).json({ error: "Connect account not found" });
    }
    const account = await stripe.accounts.retrieve(user.stripeConnectAccountId);
    return res.json({
      ok: true,
      accountId: account.id,
      chargesEnabled: account.charges_enabled,
      payoutsEnabled: account.payouts_enabled,
      detailsSubmitted: account.details_submitted,
      requirements: account.requirements,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "unknown error";
    return res.status(400).json({ error: message });
  }
});

app.post("/v1/connect/login-links", async (req, res) => {
  try {
    const { userId } = req.body ?? {};
    if (!userId) return res.status(400).json({ error: "Missing userId" });

    const user = await store.getUser(userId);
    if (!user?.stripeConnectAccountId) {
      return res.status(400).json({ error: "Connect account not found" });
    }

    const loginLink = await stripe.accounts.createLoginLink(user.stripeConnectAccountId);
    return res.json({ ok: true, url: loginLink.url });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "unknown error";
    return res.status(400).json({ error: message });
  }
});

app.post("/v1/purchases/content", async (req, res) => {
  try {
    const { userId, creatorId, contentType, contentId, amount } = req.body ?? {};
    if (!userId || !creatorId || !contentType || !contentId || !amount) {
      return res.status(400).json({
        error: "Missing fields. Required: { userId, creatorId, contentType, contentId, amount }",
      });
    }
    if (amount < 100 || amount > 10000) {
      return res.status(400).json({ error: "Amount must be between JPY 100 and 10,000" });
    }

    const buyer = await store.getUser(userId);
    if (!buyer?.stripeCustomerId) {
      return res.status(400).json({ error: "Buyer has no payment method registered" });
    }

    const platformFee = Math.floor(amount * (PLATFORM_FEE_PERCENT / 100));
    const creatorReceives = amount - platformFee;
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: "jpy",
      customer: buyer.stripeCustomerId,
      payment_method: buyer.stripeDefaultPaymentMethodId,
      confirm: true,
      automatic_payment_methods: {
        enabled: true,
        allow_redirects: "never",
      },
      metadata: {
        buyerId: userId,
        creatorId,
        contentType,
        contentId,
        platformFee: String(platformFee),
        creatorReceives: String(creatorReceives),
      },
    });

    if (paymentIntent.status === "succeeded") {
      return res.json({
        ok: true,
        status: "succeeded",
        paymentIntentId: paymentIntent.id,
        amount,
        platformFee,
        creatorReceives,
      });
    }
    return res.json({
      ok: false,
      status: paymentIntent.status,
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "unknown error";
    return res.status(400).json({ error: message });
  }
});

// recipes
app.get("/v1/recipes", async (req, res) => {
  try {
    const userId = resolveUserId(req);
    const items = await store.listRecipes(userId);
    return res.json({ data: { items } });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "unknown error";
    return res.status(500).json({ error: message });
  }
});

app.get("/v1/recipes/:id", async (req, res) => {
  try {
    const userId = resolveUserId(req);
    const recipe = await store.getRecipe(userId, req.params.id);
    if (!recipe) return res.status(404).json({ error: "Recipe not found" });
    return res.json({ data: recipe });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "unknown error";
    return res.status(500).json({ error: message });
  }
});

app.post("/v1/recipes", async (req, res) => {
  try {
    const userId = resolveUserId(req);
    const { title, servings } = req.body ?? {};
    if (!title || !servings) {
      return res.status(400).json({ error: "title and servings are required" });
    }
    const recipe = await store.createRecipe({ userId, ...req.body });
    return res.status(201).json({ data: recipe });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "unknown error";
    return res.status(500).json({ error: message });
  }
});

app.patch("/v1/recipes/:id", async (req, res) => {
  try {
    const userId = resolveUserId(req);
    const updated = await store.updateRecipe(userId, req.params.id, req.body ?? {});
    if (!updated) return res.status(404).json({ error: "Recipe not found" });
    return res.json({ data: updated });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "unknown error";
    return res.status(500).json({ error: message });
  }
});

app.delete("/v1/recipes/:id", async (req, res) => {
  try {
    const userId = resolveUserId(req);
    const deleted = await store.deleteRecipe(userId, req.params.id);
    if (!deleted) return res.status(404).json({ error: "Recipe not found" });
    return res.json({ data: { id: req.params.id, deleted: true } });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "unknown error";
    return res.status(500).json({ error: message });
  }
});

// sets
app.get("/v1/sets", async (req, res) => {
  try {
    const userId = resolveUserId(req);
    const items = await store.listSets(userId);
    return res.json({ data: { items } });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "unknown error";
    return res.status(500).json({ error: message });
  }
});

app.get("/v1/sets/:id", async (req, res) => {
  try {
    const userId = resolveUserId(req);
    const set = await store.getSet(userId, req.params.id);
    if (!set) return res.status(404).json({ error: "Set not found" });
    return res.json({ data: set });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "unknown error";
    return res.status(500).json({ error: message });
  }
});

app.post("/v1/sets", async (req, res) => {
  try {
    const userId = resolveUserId(req);
    const { title, recipeIds } = req.body ?? {};
    if (!title || !Array.isArray(recipeIds)) {
      return res.status(400).json({ error: "title and recipeIds are required" });
    }
    const set = await store.createSet({ userId, ...req.body });
    return res.status(201).json({ data: set });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "unknown error";
    return res.status(500).json({ error: message });
  }
});

app.patch("/v1/sets/:id", async (req, res) => {
  try {
    const userId = resolveUserId(req);
    const updated = await store.updateSet(userId, req.params.id, req.body ?? {});
    if (!updated) return res.status(404).json({ error: "Set not found" });
    return res.json({ data: updated });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "unknown error";
    return res.status(500).json({ error: message });
  }
});

app.delete("/v1/sets/:id", async (req, res) => {
  try {
    const userId = resolveUserId(req);
    const deleted = await store.deleteSet(userId, req.params.id);
    if (!deleted) return res.status(404).json({ error: "Set not found" });
    return res.json({ data: { id: req.params.id, deleted: true } });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "unknown error";
    return res.status(500).json({ error: message });
  }
});

// plan
app.get("/v1/plan", async (req, res) => {
  try {
    const userId = resolveUserId(req);
    const plan = await store.getPlan(userId);
    return res.json({ data: plan });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "unknown error";
    return res.status(500).json({ error: message });
  }
});

app.post("/v1/plan/select-set", async (req, res) => {
  try {
    const userId = resolveUserId(req);
    const { setId, slot } = req.body ?? {};
    if (!setId || (slot !== "current" && slot !== "next")) {
      return res.status(400).json({ error: "setId and slot(current|next) are required" });
    }
    const set = await store.getSet(userId, setId);
    if (!set) return res.status(404).json({ error: "Set not found" });
    const items = await store.buildPlanItems(userId, set.recipeIds);
    const planSlot = {
      setId: set.id,
      setTitle: set.title,
      appliedAt: nowIso(),
      items,
    };
    await store.setPlanSlot(userId, slot, planSlot);
    return res.json({ data: planSlot });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "unknown error";
    return res.status(500).json({ error: message });
  }
});

app.patch("/v1/plan/items/:id", async (req, res) => {
  try {
    const userId = resolveUserId(req);
    const { isCooked } = req.body ?? {};
    if (typeof isCooked !== "boolean") {
      return res.status(400).json({ error: "isCooked(boolean) is required" });
    }
    const result = await store.updatePlanItemCooked(userId, req.params.id, isCooked);
    if (!result) return res.status(404).json({ error: "Plan item not found" });
    return res.json({ data: result });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "unknown error";
    return res.status(500).json({ error: message });
  }
});

// shopping
app.get("/v1/shopping-list", async (req, res) => {
  try {
    const userId = resolveUserId(req);
    const items = await store.listShoppingItems(userId);
    return res.json({ data: { items } });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "unknown error";
    return res.status(500).json({ error: message });
  }
});

app.post("/v1/shopping-list/items", async (req, res) => {
  try {
    const userId = resolveUserId(req);
    const { name, quantity, unit } = req.body ?? {};
    if (!name || typeof quantity !== "number" || !unit) {
      return res.status(400).json({ error: "name, quantity(number), unit are required" });
    }
    const item = await store.createShoppingItem(userId, { name, quantity, unit });
    return res.status(201).json({ data: item });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "unknown error";
    return res.status(500).json({ error: message });
  }
});

app.patch("/v1/shopping-list/items/:id", async (req, res) => {
  try {
    const userId = resolveUserId(req);
    const updated = await store.updateShoppingItem(userId, req.params.id, req.body ?? {});
    if (!updated) return res.status(404).json({ error: "Shopping item not found" });
    return res.json({ data: updated });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "unknown error";
    return res.status(500).json({ error: message });
  }
});

app.post("/v1/shopping-list/complete", async (req, res) => {
  try {
    const userId = resolveUserId(req);
    const result = await store.completeShopping(userId);
    return res.json({ data: result });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "unknown error";
    return res.status(500).json({ error: message });
  }
});

// fridge
app.get("/v1/fridge", async (req, res) => {
  try {
    const userId = resolveUserId(req);
    const items = await store.listFridgeItems(userId);
    return res.json({ data: { items } });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "unknown error";
    return res.status(500).json({ error: message });
  }
});

app.post("/v1/fridge/items", async (req, res) => {
  try {
    const userId = resolveUserId(req);
    const { name, quantity, unit, note } = req.body ?? {};
    if (!name || typeof quantity !== "number" || !unit) {
      return res.status(400).json({ error: "name, quantity(number), unit are required" });
    }
    const item = await store.createFridgeItem(userId, {
      name,
      quantity,
      unit,
      note: note ?? null,
    });
    return res.status(201).json({ data: item });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "unknown error";
    return res.status(500).json({ error: message });
  }
});

app.patch("/v1/fridge/items/:id", async (req, res) => {
  try {
    const userId = resolveUserId(req);
    const updated = await store.updateFridgeItem(userId, req.params.id, req.body ?? {});
    if (!updated) return res.status(404).json({ error: "Fridge item not found" });
    return res.json({ data: updated });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "unknown error";
    return res.status(500).json({ error: message });
  }
});

app.delete("/v1/fridge/items/:id", async (req, res) => {
  try {
    const userId = resolveUserId(req);
    const deleted = await store.deleteFridgeItem(userId, req.params.id);
    if (!deleted) return res.status(404).json({ error: "Fridge item not found" });
    return res.json({ data: { id: deleted.id, deletedAt: deleted.deletedAt } });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "unknown error";
    return res.status(500).json({ error: message });
  }
});

app.get("/v1/fridge/deleted", async (req, res) => {
  try {
    const userId = resolveUserId(req);
    const items = await store.listDeletedFridgeItems(userId);
    return res.json({ data: { items } });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "unknown error";
    return res.status(500).json({ error: message });
  }
});

app.post("/v1/fridge/items/:id/restore", async (req, res) => {
  try {
    const userId = resolveUserId(req);
    const restored = await store.restoreFridgeItem(userId, req.params.id);
    if (!restored) return res.status(404).json({ error: "Deleted item not found" });
    return res.json({ data: restored });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "unknown error";
    return res.status(500).json({ error: message });
  }
});

app.get("/v1/users/:userId", async (req, res) => {
  try {
    const user = await store.getUser(req.params.userId);
    if (!user) return res.status(404).json({ error: "User not found" });
    return res.json(user);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "unknown error";
    return res.status(500).json({ error: message });
  }
});

if (!process.env.AWS_LAMBDA_FUNCTION_NAME) {
  app.listen(PORT, () => {
    console.log(`\n========================================`);
    console.log(`  Kondate Loop API`);
    console.log(`========================================`);
    console.log(`  Server:   http://localhost:${PORT}`);
    console.log(`  Health:   http://localhost:${PORT}/health`);
    console.log(`  Webhook:  POST http://localhost:${PORT}/webhooks/stripe`);
    console.log(`  Driver:   ${(process.env.DATA_STORE_DRIVER ?? "file").toLowerCase()}`);
    console.log(`========================================\n`);
  });
}
