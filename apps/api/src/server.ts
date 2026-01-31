import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import Stripe from "stripe";
import fs from "fs/promises";
import path from "path";

dotenv.config();

const PORT = Number(process.env.PORT ?? 4242);
const CORS_ORIGIN = process.env.CORS_ORIGIN ?? "http://localhost:5173";

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
if (!STRIPE_SECRET_KEY) throw new Error("Missing STRIPE_SECRET_KEY in .env");

const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET ?? "";
const STRIPE_PRICE_ID_USER_PLUS = process.env.STRIPE_PRICE_ID_USER_PLUS ?? "";

const stripe = new Stripe(STRIPE_SECRET_KEY);

const app = express();

// ======================
// Webhook（生のbodyが必要）
// ======================
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
        console.warn("STRIPE_WEBHOOK_SECRET not set, skipping signature verification");
        // 開発中はシークレット未設定でも動くようにする
        const event = JSON.parse(req.body.toString());
        await handleWebhookEvent(event);
        return res.json({ received: true });
      }

      const event = stripe.webhooks.constructEvent(
        req.body,
        sig,
        STRIPE_WEBHOOK_SECRET
      );

      await handleWebhookEvent(event);
      res.json({ received: true });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "unknown";
      console.error("Webhook Error:", message);
      return res.status(400).send(`Webhook Error: ${message}`);
    }
  }
);

async function handleWebhookEvent(event: Stripe.Event) {
  switch (event.type) {
    case "invoice.paid": {
      const invoice = event.data.object as Stripe.Invoice;
      await markUserByCustomerId(invoice.customer as string, {
        plan: "user_plus",
        subscriptionStatus: "active",
      });
      console.log(`[Webhook] invoice.paid: ${invoice.customer}`);
      break;
    }

    case "invoice.payment_failed": {
      const invoice = event.data.object as Stripe.Invoice;
      await markUserByCustomerId(invoice.customer as string, {
        subscriptionStatus: "past_due",
      });
      console.log(`[Webhook] invoice.payment_failed: ${invoice.customer}`);
      break;
    }

    case "customer.subscription.deleted": {
      const sub = event.data.object as Stripe.Subscription;
      await markUserByCustomerId(sub.customer as string, {
        subscriptionStatus: "canceled",
        plan: "free",
      });
      console.log(`[Webhook] customer.subscription.deleted: ${sub.customer}`);
      break;
    }

    case "customer.subscription.updated": {
      const sub = event.data.object as Stripe.Subscription;
      await markUserByCustomerId(sub.customer as string, {
        subscriptionStatus: sub.status ?? "unknown",
      });
      console.log(`[Webhook] customer.subscription.updated: ${sub.customer} -> ${sub.status}`);
      break;
    }

    default:
      console.log(`[Webhook] Unhandled event type: ${event.type}`);
  }
}

// ここから下は通常API（JSON bodyでOK）
app.use(cors({ origin: CORS_ORIGIN, credentials: true }));
app.use(express.json());

// ======================
// 開発用の簡易ストア
// ======================
type UserRecord = {
  userId: string;
  email: string;
  stripeCustomerId?: string;
  stripeDefaultPaymentMethodId?: string;
  stripeSubscriptionId?: string;
  plan?: "free" | "user_plus";
  subscriptionStatus?: string;
};

type Store = { users: Record<string, UserRecord> };

const STORE_PATH = path.join(process.cwd(), "data", "store.json");

async function readStore(): Promise<Store> {
  try {
    const raw = await fs.readFile(STORE_PATH, "utf8");
    return JSON.parse(raw);
  } catch (e: unknown) {
    const err = e as NodeJS.ErrnoException;
    if (err.code === "ENOENT") {
      await fs.mkdir(path.dirname(STORE_PATH), { recursive: true });
      const init: Store = { users: {} };
      await fs.writeFile(STORE_PATH, JSON.stringify(init, null, 2), "utf8");
      return init;
    }
    throw e;
  }
}

async function writeStore(store: Store): Promise<void> {
  await fs.mkdir(path.dirname(STORE_PATH), { recursive: true });
  await fs.writeFile(STORE_PATH, JSON.stringify(store, null, 2), "utf8");
}

async function upsertUser(userId: string, email: string): Promise<UserRecord> {
  const store = await readStore();
  const existing = store.users[userId];
  const next: UserRecord = {
    userId,
    email,
    plan: existing?.plan ?? "free",
    subscriptionStatus: existing?.subscriptionStatus ?? "none",
    stripeCustomerId: existing?.stripeCustomerId,
    stripeDefaultPaymentMethodId: existing?.stripeDefaultPaymentMethodId,
    stripeSubscriptionId: existing?.stripeSubscriptionId,
  };
  store.users[userId] = next;
  await writeStore(store);
  return next;
}

async function getUser(userId: string): Promise<UserRecord | null> {
  const store = await readStore();
  return store.users[userId] ?? null;
}

async function findUserByCustomerId(
  customerId: string
): Promise<UserRecord | null> {
  const store = await readStore();
  const users = Object.values(store.users);
  return users.find((u) => u.stripeCustomerId === customerId) ?? null;
}

async function markUserByCustomerId(
  customerId: string,
  patch: Partial<UserRecord>
) {
  const u = await findUserByCustomerId(customerId);
  if (!u) {
    console.warn("No user found for customer:", customerId);
    return;
  }
  const store = await readStore();
  store.users[u.userId] = { ...store.users[u.userId], ...patch };
  await writeStore(store);
}

// ======================
// API: health check
// ======================
app.get("/health", (_req, res) => res.json({ ok: true }));

// ======================
// API: 支払い方法登録
// POST /v1/payment-methods
// ======================
app.post("/v1/payment-methods", async (req, res) => {
  try {
    const { userId, email, paymentMethodId } = req.body ?? {};
    if (!userId || !email || !paymentMethodId) {
      return res.status(400).json({
        error: "Missing fields. Required: { userId, email, paymentMethodId }",
      });
    }

    const user = await upsertUser(userId, email);

    // 1) Stripe Customer を用意（無ければ作る）
    let customerId = user.stripeCustomerId;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email,
        metadata: { userId },
      });
      customerId = customer.id;
    }

    // 2) PaymentMethod を Customer に紐づける
    await stripe.paymentMethods.attach(paymentMethodId, { customer: customerId });

    // 3) デフォルト支払い方法に設定
    await stripe.customers.update(customerId, {
      invoice_settings: { default_payment_method: paymentMethodId },
    });

    // 4) 保存
    const store = await readStore();
    store.users[userId] = {
      ...store.users[userId],
      stripeCustomerId: customerId,
      stripeDefaultPaymentMethodId: paymentMethodId,
    };
    await writeStore(store);

    // カード情報を返す
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
    console.error(err);
    return res.status(400).json({ error: message });
  }
});

// ======================
// API: サブスク開始
// POST /v1/subscriptions
// ======================
app.post("/v1/subscriptions", async (req, res) => {
  try {
    const { userId, priceId } = req.body ?? {};
    if (!userId) {
      return res.status(400).json({ error: "Missing userId" });
    }

    const user = await getUser(userId);
    if (!user || !user.stripeCustomerId) {
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

    const subscription = await stripe.subscriptions.create({
      customer: user.stripeCustomerId,
      items: [{ price: usePriceId }],
      payment_behavior: "default_incomplete",
      payment_settings: { save_default_payment_method: "on_subscription" },
      expand: ["latest_invoice.payment_intent", "latest_invoice.confirmation_secret"],
      metadata: { userId, plan: "user_plus" },
    });

    // clientSecret 抽出
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

    // 保存
    const store = await readStore();
    store.users[userId] = {
      ...store.users[userId],
      stripeSubscriptionId: subscription.id,
      plan: "user_plus",
      subscriptionStatus: subscription.status ?? "unknown",
    };
    await writeStore(store);

    return res.json({
      ok: true,
      subscriptionId: subscription.id,
      status: subscription.status,
      clientSecret,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "unknown error";
    console.error(err);
    return res.status(400).json({ error: message });
  }
});

// ======================
// API: サブスク解約（期間末解約）
// DELETE /v1/subscriptions
// ======================
app.delete("/v1/subscriptions", async (req, res) => {
  try {
    const { userId } = req.body ?? {};
    if (!userId) return res.status(400).json({ error: "Missing userId" });

    const user = await getUser(userId);
    if (!user?.stripeSubscriptionId) {
      return res.status(400).json({ error: "No subscription to cancel" });
    }

    const updated = await stripe.subscriptions.update(user.stripeSubscriptionId, {
      cancel_at_period_end: true,
    });

    // 保存
    const store = await readStore();
    store.users[userId] = {
      ...store.users[userId],
      subscriptionStatus: updated.status ?? "unknown",
    };
    await writeStore(store);

    return res.json({ ok: true, subscription: updated });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "unknown error";
    console.error(err);
    return res.status(400).json({ error: message });
  }
});

// ======================
// API: ユーザー情報取得（デバッグ用）
// GET /v1/users/:userId
// ======================
app.get("/v1/users/:userId", async (req, res) => {
  try {
    const user = await getUser(req.params.userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    return res.json(user);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "unknown error";
    return res.status(500).json({ error: message });
  }
});

app.listen(PORT, () => {
  console.log(`\n========================================`);
  console.log(`  Kondate Loop Payments API`);
  console.log(`========================================`);
  console.log(`  Server:   http://localhost:${PORT}`);
  console.log(`  Health:   http://localhost:${PORT}/health`);
  console.log(`  Webhook:  POST http://localhost:${PORT}/webhooks/stripe`);
  console.log(`========================================\n`);
});
