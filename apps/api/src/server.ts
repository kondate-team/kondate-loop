import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import Stripe from "stripe";
import { randomUUID } from "crypto";
import {
  AdminConfirmSignUpCommand,
  CognitoIdentityProviderClient,
  GetUserCommand,
  GlobalSignOutCommand,
  InitiateAuthCommand,
  RevokeTokenCommand,
  SignUpCommand,
  type AuthenticationResultType,
} from "@aws-sdk/client-cognito-identity-provider";
import { createDataStore } from "./db/storeFactory";
import type {
  CategoryRecord,
  CategoryScope,
  NotificationType,
  PlanType,
  PurchaseItemType,
  SubscriptionPlanId,
  SubscriptionStatus,
  UserRecord,
  UserRole,
} from "./db/types";

dotenv.config();

const PORT = Number(process.env.PORT ?? 4242);
const DEFAULT_CORS_ORIGINS = [
  "http://localhost:5173",
  "https://da8ahpdul87cu.cloudfront.net",
];

function parseCorsOrigins(rawValue: string | undefined): string[] {
  const origins = rawValue
    ?.split(",")
    .map((value) => value.trim())
    .filter((value) => value.length > 0);
  if (!origins || origins.length === 0) {
    return DEFAULT_CORS_ORIGINS;
  }
  return Array.from(new Set(origins));
}

const CORS_ORIGINS = parseCorsOrigins(process.env.CORS_ORIGINS ?? process.env.CORS_ORIGIN);

function resolveOptionalEnvString(value: string | undefined): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

const COGNITO_USER_POOL_ID = resolveOptionalEnvString(process.env.COGNITO_USER_POOL_ID);
const COGNITO_CLIENT_ID = resolveOptionalEnvString(process.env.COGNITO_CLIENT_ID);
const COGNITO_REGION =
  resolveOptionalEnvString(process.env.COGNITO_REGION) ??
  resolveOptionalEnvString(process.env.AWS_REGION) ??
  resolveOptionalEnvString(process.env.AWS_DEFAULT_REGION) ??
  "ap-northeast-1";
const COGNITO_AUTH_ENABLED = Boolean(COGNITO_USER_POOL_ID && COGNITO_CLIENT_ID);
const cognitoClient = COGNITO_AUTH_ENABLED
  ? new CognitoIdentityProviderClient({ region: COGNITO_REGION })
  : null;

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY ?? "sk_test_dummy";
if (!process.env.STRIPE_SECRET_KEY) {
  console.warn("STRIPE_SECRET_KEY is not set. Stripe endpoints will fail until configured.");
}

const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET ?? "";
const STRIPE_PRICE_ID_USER_PLUS = process.env.STRIPE_PRICE_ID_USER_PLUS ?? "";
const STRIPE_PRICE_ID_CREATOR_PLUS = process.env.STRIPE_PRICE_ID_CREATOR_PLUS ?? "";
const STRIPE_PRICE_ID_CREATOR = process.env.STRIPE_PRICE_ID_CREATOR ?? "";
const PLATFORM_FEE_PERCENT = Number(process.env.PLATFORM_FEE_PERCENT ?? 10);
const SHARE_BASE_URL = process.env.SHARE_BASE_URL ?? "https://kondate-loop.com";

const stripe = new Stripe(STRIPE_SECRET_KEY);
const store = createDataStore();
export const app = express();
console.info(`[bootstrap] CORS origins: ${CORS_ORIGINS.join(", ")}`);
if (COGNITO_AUTH_ENABLED) {
  console.info(
    `[bootstrap] Cognito auth enabled: region=${COGNITO_REGION}, userPoolId=${COGNITO_USER_POOL_ID}`
  );
}
const DEFAULT_CATEGORY_THEMES: Record<CategoryScope, string[]> = {
  book: ["muted", "amber"],
  catalog: ["muted", "sky"],
};
const PURCHASE_AMOUNT_BY_TYPE: Record<PurchaseItemType, number> = {
  recipe: 680,
  set: 1980,
};

function nowIso(): string {
  return new Date().toISOString();
}

function resolveUserId(req: express.Request): string {
  const bodyUserId = typeof req.body?.userId === "string" ? req.body.userId : "";
  const queryUserId = typeof req.query?.userId === "string" ? req.query.userId : "";
  const headerUserId = typeof req.headers["x-user-id"] === "string" ? req.headers["x-user-id"] : "";
  return bodyUserId || queryUserId || headerUserId || "demo-user";
}

function resolveUserEmail(req: express.Request, userId: string): string {
  const bodyEmail = typeof req.body?.email === "string" ? req.body.email : "";
  const queryEmail = typeof req.query?.email === "string" ? req.query.email : "";
  const headerEmail =
    typeof req.headers["x-user-email"] === "string" ? req.headers["x-user-email"] : "";
  return bodyEmail || queryEmail || headerEmail || `${userId}@example.com`;
}

function resolveUserRole(user: UserRecord): UserRole {
  if (user.role) return user.role;
  if (user.plan === "creator_plus") return "creator_plus";
  if (user.plan === "creator") return "creator";
  if (user.plan === "user_plus") return "user_plus";
  return "user";
}

function toMeResponse(user: UserRecord) {
  return {
    id: user.userId,
    email: user.email,
    name: user.name ?? null,
    role: resolveUserRole(user),
    avatarUrl: user.avatarUrl ?? null,
    createdAt: user.createdAt ?? null,
    updatedAt: user.updatedAt ?? null,
  };
}

type AuthSessionResponse = {
  user: ReturnType<typeof toMeResponse>;
  accessToken: string;
  refreshToken: string;
  tokenType: "Bearer";
  expiresIn: number;
  issuedAt: string;
};

type CognitoIdentity = {
  userId: string;
  email: string;
  name: string | null;
};

const AUTH_ACCESS_TOKEN_EXPIRES_IN_SECONDS = Number(
  process.env.AUTH_ACCESS_TOKEN_EXPIRES_IN_SECONDS ?? 60 * 60
);

function resolveNonEmptyString(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function resolveErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message) return error.message;
  return "unknown error";
}

function resolveCognitoErrorStatus(error: unknown): number {
  const name = error instanceof Error ? error.name : "";
  switch (name) {
    case "NotAuthorizedException":
    case "UserNotFoundException":
    case "UserNotConfirmedException":
      return 401;
    case "UsernameExistsException":
    case "InvalidPasswordException":
    case "InvalidParameterException":
      return 400;
    default:
      return 500;
  }
}

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function deriveUserIdFromEmail(email: string): string {
  const safe = normalizeEmail(email).replace(/[^a-z0-9._-]+/g, "_");
  return `user_${safe || "demo"}`;
}

function resolveBearerAccessToken(req: express.Request): string | null {
  const authHeader = req.headers.authorization;
  if (typeof authHeader !== "string") return null;
  const [scheme, token] = authHeader.split(/\s+/);
  if (!scheme || !token) return null;
  return scheme.toLowerCase() === "bearer" ? token.trim() : null;
}

function requireCognitoConfig(): {
  client: CognitoIdentityProviderClient;
  userPoolId: string;
  clientId: string;
} {
  if (!cognitoClient || !COGNITO_USER_POOL_ID || !COGNITO_CLIENT_ID) {
    throw new Error("Cognito configuration is missing");
  }
  return {
    client: cognitoClient,
    userPoolId: COGNITO_USER_POOL_ID,
    clientId: COGNITO_CLIENT_ID,
  };
}

function toCognitoSession(
  result: AuthenticationResultType | undefined,
  fallbackRefreshToken?: string
): { accessToken: string; refreshToken: string; expiresIn: number } {
  const accessToken = resolveNonEmptyString(result?.AccessToken);
  const refreshToken = resolveNonEmptyString(result?.RefreshToken) ?? fallbackRefreshToken ?? null;
  if (!accessToken) {
    throw new Error("Cognito access token was not returned");
  }
  if (!refreshToken) {
    throw new Error("Cognito refresh token was not returned");
  }
  return {
    accessToken,
    refreshToken,
    expiresIn: result?.ExpiresIn ?? AUTH_ACCESS_TOKEN_EXPIRES_IN_SECONDS,
  };
}

async function loadCognitoIdentityByAccessToken(accessToken: string): Promise<CognitoIdentity> {
  const { client } = requireCognitoConfig();
  const response = await client.send(new GetUserCommand({ AccessToken: accessToken }));
  const attrs = new Map<string, string>();
  for (const attribute of response.UserAttributes ?? []) {
    if (attribute.Name && attribute.Value) {
      attrs.set(attribute.Name, attribute.Value);
    }
  }

  const userId = attrs.get("sub") ?? response.Username ?? null;
  if (!userId) {
    throw new Error("Cognito user id is missing");
  }
  const email = normalizeEmail(attrs.get("email") ?? `${userId}@example.com`);
  const name = attrs.get("name") ?? null;
  return { userId, email, name };
}

async function ensureAuthUserByIdentity(identity: CognitoIdentity): Promise<UserRecord> {
  let user = await store.getUser(identity.userId);
  if (!user) {
    user = await store.upsertUser(identity.userId, identity.email);
  } else if (!user.email) {
    user = (await store.updateUser(identity.userId, { email: identity.email })) ?? user;
  }

  const patch: Partial<UserRecord> = {};
  if (identity.name && identity.name.length <= 50 && identity.name !== user.name) {
    patch.name = identity.name;
  }
  if (Object.keys(patch).length > 0) {
    user = (await store.updateUser(identity.userId, patch)) ?? user;
  }
  return user;
}

async function ensureAuthUser(req: express.Request): Promise<UserRecord> {
  const userId = resolveUserId(req);
  const email = resolveUserEmail(req, userId);
  return ensureAuthUserByIdentity({ userId, email: normalizeEmail(email), name: null });
}

async function cognitoSignUpAndAuthenticate(
  email: string,
  password: string,
  name: string | null
): Promise<{
  identity: CognitoIdentity;
  tokenSet: { accessToken: string; refreshToken: string; expiresIn: number };
}> {
  const { client, userPoolId, clientId } = requireCognitoConfig();
  const signUpResult = await client.send(
    new SignUpCommand({
      ClientId: clientId,
      Username: email,
      Password: password,
      UserAttributes: [
        { Name: "email", Value: email },
        ...(name ? [{ Name: "name", Value: name }] : []),
      ],
    })
  );
  if (!signUpResult.UserConfirmed) {
    await client.send(
      new AdminConfirmSignUpCommand({
        UserPoolId: userPoolId,
        Username: email,
      })
    );
  }
  const auth = await client.send(
    new InitiateAuthCommand({
      AuthFlow: "USER_PASSWORD_AUTH",
      ClientId: clientId,
      AuthParameters: {
        USERNAME: email,
        PASSWORD: password,
      },
    })
  );
  const tokenSet = toCognitoSession(auth.AuthenticationResult);
  const userId = resolveNonEmptyString(signUpResult.UserSub);
  if (userId) {
    return {
      identity: {
        userId,
        email,
        name,
      },
      tokenSet,
    };
  }

  console.warn("[auth] Cognito signUp result did not include UserSub; fallback to GetUser.");
  const identity = await loadCognitoIdentityByAccessToken(tokenSet.accessToken);
  return {
    identity: {
      ...identity,
      name: name ?? identity.name,
    },
    tokenSet,
  };
}

async function cognitoLogin(
  email: string,
  password: string
): Promise<{ accessToken: string; refreshToken: string; expiresIn: number }> {
  const { client, clientId } = requireCognitoConfig();
  const auth = await client.send(
    new InitiateAuthCommand({
      AuthFlow: "USER_PASSWORD_AUTH",
      ClientId: clientId,
      AuthParameters: {
        USERNAME: email,
        PASSWORD: password,
      },
    })
  );
  return toCognitoSession(auth.AuthenticationResult);
}

async function cognitoRefresh(
  refreshToken: string
): Promise<{ accessToken: string; refreshToken: string; expiresIn: number }> {
  const { client, clientId } = requireCognitoConfig();
  const auth = await client.send(
    new InitiateAuthCommand({
      AuthFlow: "REFRESH_TOKEN_AUTH",
      ClientId: clientId,
      AuthParameters: {
        REFRESH_TOKEN: refreshToken,
      },
    })
  );
  return toCognitoSession(auth.AuthenticationResult, refreshToken);
}

async function cognitoLogout(accessToken?: string | null, refreshToken?: string | null): Promise<boolean> {
  const { client, clientId } = requireCognitoConfig();
  let revokedRefreshToken = false;
  if (accessToken) {
    try {
      await client.send(new GlobalSignOutCommand({ AccessToken: accessToken }));
    } catch (error: unknown) {
      console.warn(`[auth] Cognito GlobalSignOut failed: ${resolveErrorMessage(error)}`);
    }
  }
  if (refreshToken) {
    try {
      await client.send(
        new RevokeTokenCommand({
          ClientId: clientId,
          Token: refreshToken,
        })
      );
      revokedRefreshToken = true;
    } catch (error: unknown) {
      console.warn(`[auth] Cognito RevokeToken failed: ${resolveErrorMessage(error)}`);
    }
  }
  return revokedRefreshToken;
}

function issueAuthSession(user: UserRecord, refreshToken?: string): AuthSessionResponse {
  const issuedAt = nowIso();
  return {
    user: toMeResponse(user),
    accessToken: `access_${randomUUID()}`,
    refreshToken: refreshToken ?? `refresh_${randomUUID()}`,
    tokenType: "Bearer",
    expiresIn: AUTH_ACCESS_TOKEN_EXPIRES_IN_SECONDS,
    issuedAt,
  };
}

function issueCognitoAuthSession(
  user: UserRecord,
  tokenSet: { accessToken: string; refreshToken: string; expiresIn: number }
): AuthSessionResponse {
  return {
    user: toMeResponse(user),
    accessToken: tokenSet.accessToken,
    refreshToken: tokenSet.refreshToken,
    tokenType: "Bearer",
    expiresIn: tokenSet.expiresIn,
    issuedAt: nowIso(),
  };
}

function buildShareUrl(targetType: "recipe" | "set", targetId: string): string {
  return `${SHARE_BASE_URL}/share/${targetType}/${targetId}`;
}

function truncate(text: string, max: number): string {
  return text.length > max ? text.slice(0, max) : text;
}

function normalizeImportLines(content: string): string[] {
  return content
    .split(/\r?\n/)
    .map((line) => line.replace(/^[-*・\d.)\s]+/, "").trim())
    .filter(Boolean);
}

function parseImportDraft(type: "url" | "text", content: string) {
  const sourceUrl = type === "url" ? content : null;
  const lines = type === "text" ? normalizeImportLines(content) : [];
  const fallbackTitle = sourceUrl ? `Imported from ${new URL(sourceUrl).hostname}` : "Imported recipe";
  const title = truncate(lines[0] ?? fallbackTitle, 80);
  const stepSource = lines.length > 1 ? lines.slice(1) : ["Please review and edit imported steps."];
  const steps = stepSource.map((text) => ({ text: truncate(text, 200) }));

  return {
    draft: {
      title,
      servings: 2,
      ingredients: [] as Array<{ name: string; quantity: string; unit: string }>,
      steps,
      sourceUrl,
      authorName: null as string | null,
      cookTimeMinutes: null as number | null,
      tags: [] as string[],
    },
    source: type,
    confidence: type === "text" && lines.length >= 3 ? "medium" : "low",
  };
}

function resolveCategoryScope(value: unknown): CategoryScope | null {
  return value === "book" || value === "catalog" ? value : null;
}

function isValidMonth(month: string): boolean {
  return /^\d{4}-\d{2}$/.test(month);
}

function isValidDate(date: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(date);
}

function resolveNotificationType(value: unknown): NotificationType | "all" {
  if (value === "news" || value === "personal" || value === "all") return value;
  return "all";
}

function normalizeSubscriptionStatus(status: string | null | undefined): SubscriptionStatus {
  if (status === "active") return "active";
  if (status === "past_due") return "past_due";
  if (status === "canceled") return "canceled";
  if (status === "incomplete") return "incomplete";
  return "incomplete";
}

function toSubscriptionPlanId(plan: PlanType | undefined): SubscriptionPlanId {
  return plan === "creator_plus" ? "creator_plus" : "user_plus";
}

function buildDefaultCategories(userId: string, scope: CategoryScope): CategoryRecord[] {
  const now = nowIso();
  const labels = scope === "book" ? ["All", "Main"] : ["All", "Featured"];
  return labels.map((tagName, index) => ({
    id: `default-${scope}-${index}`,
    userId,
    scope,
    tagName,
    order: index,
    isDefault: true,
    isHidden: false,
    colorTheme: DEFAULT_CATEGORY_THEMES[scope][index] ?? null,
    createdAt: now,
    updatedAt: now,
  }));
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

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || CORS_ORIGINS.includes("*") || CORS_ORIGINS.includes(origin)) {
        callback(null, true);
        return;
      }
      callback(null, false);
    },
    credentials: true,
  })
);
app.use(express.json());

app.get("/health", (_req, res) => res.json({ ok: true }));

app.get("/v1/auth/me", async (req, res) => {
  try {
    if (COGNITO_AUTH_ENABLED) {
      const accessToken = resolveBearerAccessToken(req);
      if (!accessToken) {
        return res.status(401).json({ error: "Authorization bearer token is required" });
      }
      const identity = await loadCognitoIdentityByAccessToken(accessToken);
      const user = await ensureAuthUserByIdentity(identity);
      return res.json({ data: toMeResponse(user) });
    }
    const user = await ensureAuthUser(req);
    return res.json({ data: toMeResponse(user) });
  } catch (err: unknown) {
    const status = COGNITO_AUTH_ENABLED ? resolveCognitoErrorStatus(err) : 500;
    return res.status(status).json({ error: resolveErrorMessage(err) });
  }
});

app.post(["/v1/auth/signup", "/auth/signup"], async (req, res) => {
  try {
    const emailRaw = resolveNonEmptyString(req.body?.email);
    const password = resolveNonEmptyString(req.body?.password);
    const name = resolveNonEmptyString(req.body?.name);
    if (!emailRaw || !password) {
      return res.status(400).json({ error: "email and password are required" });
    }
    if (password.length < 8) {
      return res.status(400).json({ error: "password must be at least 8 characters" });
    }

    const email = normalizeEmail(emailRaw);
    if (COGNITO_AUTH_ENABLED) {
      const { identity, tokenSet } = await cognitoSignUpAndAuthenticate(email, password, name);
      const user = await ensureAuthUserByIdentity(identity);
      return res.json({ data: issueCognitoAuthSession(user, tokenSet) });
    }

    let user = await ensureAuthUserByIdentity({
      userId: deriveUserIdFromEmail(email),
      email,
      name,
    });
    if (name && name.length <= 50) {
      user = (await store.updateUser(user.userId, { name })) ?? user;
    }
    return res.json({ data: issueAuthSession(user) });
  } catch (err: unknown) {
    const status = COGNITO_AUTH_ENABLED ? resolveCognitoErrorStatus(err) : 500;
    return res.status(status).json({ error: resolveErrorMessage(err) });
  }
});

app.post(["/v1/auth/login", "/auth/login"], async (req, res) => {
  try {
    const emailRaw = resolveNonEmptyString(req.body?.email);
    const password = resolveNonEmptyString(req.body?.password);
    if (!emailRaw || !password) {
      return res.status(400).json({ error: "email and password are required" });
    }

    const email = normalizeEmail(emailRaw);
    if (COGNITO_AUTH_ENABLED) {
      const tokenSet = await cognitoLogin(email, password);
      const identity = await loadCognitoIdentityByAccessToken(tokenSet.accessToken);
      const user = await ensureAuthUserByIdentity(identity);
      return res.json({ data: issueCognitoAuthSession(user, tokenSet) });
    }

    const user = await ensureAuthUserByIdentity({
      userId: deriveUserIdFromEmail(email),
      email,
      name: null,
    });
    return res.json({ data: issueAuthSession(user) });
  } catch (err: unknown) {
    const status = COGNITO_AUTH_ENABLED ? resolveCognitoErrorStatus(err) : 500;
    return res.status(status).json({ error: resolveErrorMessage(err) });
  }
});

app.post(["/v1/auth/callback", "/auth/callback"], async (req, res) => {
  try {
    const code = resolveNonEmptyString(req.body?.code);
    const idToken = resolveNonEmptyString(req.body?.idToken);
    const accessToken = resolveNonEmptyString(req.body?.accessToken);
    if (!code && !idToken && !accessToken) {
      return res.status(400).json({ error: "code, idToken, or accessToken is required" });
    }

    if (COGNITO_AUTH_ENABLED) {
      if (!accessToken) {
        return res.status(400).json({ error: "accessToken is required when Cognito is enabled" });
      }
      const refreshToken = resolveNonEmptyString(req.body?.refreshToken);
      if (!refreshToken) {
        return res.status(400).json({ error: "refreshToken is required when Cognito is enabled" });
      }
      const identity = await loadCognitoIdentityByAccessToken(accessToken);
      const user = await ensureAuthUserByIdentity(identity);
      return res.json({
        data: issueCognitoAuthSession(user, {
          accessToken,
          refreshToken,
          expiresIn: AUTH_ACCESS_TOKEN_EXPIRES_IN_SECONDS,
        }),
      });
    }

    let user = await ensureAuthUser(req);
    const patch: Partial<UserRecord> = {};
    const name = resolveNonEmptyString(req.body?.name);
    if (name && name.length <= 50) {
      patch.name = name;
    }
    const avatarUrl = req.body?.avatarUrl;
    if (avatarUrl === null || (typeof avatarUrl === "string" && avatarUrl.length <= 500)) {
      patch.avatarUrl = avatarUrl;
    }
    if (Object.keys(patch).length > 0) {
      user = (await store.updateUser(user.userId, patch)) ?? user;
    }

    const providedRefreshToken = resolveNonEmptyString(req.body?.refreshToken) ?? undefined;
    return res.json({ data: issueAuthSession(user, providedRefreshToken) });
  } catch (err: unknown) {
    const status = COGNITO_AUTH_ENABLED ? resolveCognitoErrorStatus(err) : 500;
    return res.status(status).json({ error: resolveErrorMessage(err) });
  }
});

app.post(["/v1/auth/refresh", "/auth/refresh"], async (req, res) => {
  try {
    const refreshToken = resolveNonEmptyString(req.body?.refreshToken);
    if (!refreshToken) {
      return res.status(400).json({ error: "refreshToken is required" });
    }
    if (COGNITO_AUTH_ENABLED) {
      const tokenSet = await cognitoRefresh(refreshToken);
      const identity = await loadCognitoIdentityByAccessToken(tokenSet.accessToken);
      const user = await ensureAuthUserByIdentity(identity);
      return res.json({ data: issueCognitoAuthSession(user, tokenSet) });
    }
    const user = await ensureAuthUser(req);
    return res.json({ data: issueAuthSession(user, refreshToken) });
  } catch (err: unknown) {
    const status = COGNITO_AUTH_ENABLED ? resolveCognitoErrorStatus(err) : 500;
    return res.status(status).json({ error: resolveErrorMessage(err) });
  }
});

app.post(["/v1/auth/logout", "/auth/logout"], async (req, res) => {
  try {
    const refreshToken = resolveNonEmptyString(req.body?.refreshToken);
    if (COGNITO_AUTH_ENABLED) {
      const accessToken = resolveNonEmptyString(req.body?.accessToken) ?? resolveBearerAccessToken(req);
      const revokedRefreshToken = await cognitoLogout(accessToken, refreshToken);
      return res.json({
        data: {
          loggedOut: true,
          revokedRefreshToken,
        },
      });
    }
    const hasRefreshToken = Boolean(refreshToken);
    return res.json({
      data: {
        loggedOut: true,
        revokedRefreshToken: hasRefreshToken,
      },
    });
  } catch (err: unknown) {
    const status = COGNITO_AUTH_ENABLED ? resolveCognitoErrorStatus(err) : 500;
    return res.status(status).json({ error: resolveErrorMessage(err) });
  }
});

app.patch("/v1/me", async (req, res) => {
  try {
    const userId = resolveUserId(req);
    const email = resolveUserEmail(req, userId);
    const { name, avatarUrl } = req.body ?? {};
    if (name === undefined && avatarUrl === undefined) {
      return res.status(400).json({ error: "name or avatarUrl is required" });
    }
    if (name !== undefined && (typeof name !== "string" || !name.trim() || name.trim().length > 50)) {
      return res.status(400).json({ error: "name must be a non-empty string up to 50 chars" });
    }
    if (
      avatarUrl !== undefined &&
      avatarUrl !== null &&
      (typeof avatarUrl !== "string" || avatarUrl.length > 500)
    ) {
      return res.status(400).json({ error: "avatarUrl must be string, null, or omitted" });
    }

    let user = await store.getUser(userId);
    if (!user) {
      user = await store.upsertUser(userId, email);
    }
    const updated = await store.updateUser(userId, {
      name: name !== undefined ? name.trim() : user.name,
      avatarUrl: avatarUrl !== undefined ? avatarUrl : user.avatarUrl,
    });
    if (!updated) return res.status(500).json({ error: "Failed to update user profile" });
    return res.json({ data: toMeResponse(updated) });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "unknown error";
    return res.status(500).json({ error: message });
  }
});

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
    await store.upsertPaymentMethod(userId, {
      id: paymentMethodId,
      brand: pm.card?.brand ?? "unknown",
      last4: pm.card?.last4 ?? "0000",
      expMonth: pm.card?.exp_month ?? 0,
      expYear: pm.card?.exp_year ?? 0,
      isDefault: true,
    });
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

app.get("/v1/payment-methods", async (req, res) => {
  try {
    const userId = resolveUserId(req);
    const items = await store.listPaymentMethods(userId);
    return res.json({ data: { items } });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "unknown error";
    return res.status(500).json({ error: message });
  }
});

app.delete("/v1/payment-methods/:id", async (req, res) => {
  try {
    const userId = resolveUserId(req);
    const deleted = await store.deletePaymentMethod(userId, req.params.id);
    if (!deleted) return res.status(404).json({ error: "Payment method not found" });
    const user = await store.getUser(userId);
    if (user?.stripeDefaultPaymentMethodId === req.params.id) {
      await store.updateUser(userId, { stripeDefaultPaymentMethodId: undefined });
    }
    return res.json({ data: { id: req.params.id, deleted: true } });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "unknown error";
    return res.status(500).json({ error: message });
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
    const currentPeriodEnd =
      typeof subscription.current_period_end === "number"
        ? new Date(subscription.current_period_end * 1000).toISOString()
        : nowIso();
    await store.upsertSubscription(userId, {
      subscriptionId: subscription.id,
      planId: planType === "creator_plus" ? "creator_plus" : "user_plus",
      status: normalizeSubscriptionStatus(subscription.status),
      currentPeriodEnd,
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

app.get("/v1/subscriptions", async (req, res) => {
  try {
    const userId = resolveUserId(req);
    const subscription = await store.getSubscription(userId);
    return res.json({ data: subscription });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "unknown error";
    return res.status(500).json({ error: message });
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
    await store.upsertSubscription(userId, {
      subscriptionId: user.stripeSubscriptionId,
      planId: toSubscriptionPlanId(user.plan),
      status: "canceling",
      currentPeriodEnd: nowIso(),
    });

    return res.json({ ok: true, subscription: updated });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "unknown error";
    return res.status(400).json({ error: message });
  }
});

app.post("/v1/purchases", async (req, res) => {
  try {
    const userId = resolveUserId(req);
    const { itemType, itemId, paymentMethodId } = req.body ?? {};
    if ((itemType !== "recipe" && itemType !== "set") || typeof itemId !== "string" || !itemId) {
      return res.status(400).json({ error: "itemType(recipe|set) and itemId are required" });
    }
    const purchaseItemType: PurchaseItemType = itemType;
    if (typeof paymentMethodId !== "string" || !paymentMethodId) {
      return res.status(400).json({ error: "paymentMethodId is required" });
    }

    const methods = await store.listPaymentMethods(userId);
    const hasMethod = methods.some((method) => method.id === paymentMethodId);
    if (methods.length > 0 && !hasMethod) {
      return res.status(404).json({ error: "Payment method not found" });
    }

    let itemTitle = itemId;
    if (itemType === "recipe") {
      const recipe = (await store.getCatalogRecipe(itemId)) ?? (await store.getRecipe(userId, itemId));
      if (recipe) itemTitle = recipe.title;
    } else {
      const set = (await store.getCatalogSet(itemId)) ?? (await store.getSet(userId, itemId));
      if (set) itemTitle = set.title;
    }

    const purchase = await store.createPurchase(userId, {
      itemType: purchaseItemType,
      itemId,
      itemTitle,
      amount: PURCHASE_AMOUNT_BY_TYPE[purchaseItemType],
      currency: "JPY",
      status: "succeeded",
    });
    return res.json({ data: purchase });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "unknown error";
    return res.status(500).json({ error: message });
  }
});

app.get("/v1/purchases", async (req, res) => {
  try {
    const userId = resolveUserId(req);
    const items = await store.listPurchases(userId);
    return res.json({ data: { items } });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "unknown error";
    return res.status(500).json({ error: message });
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
      await store.createPurchase(userId, {
        itemType: "set",
        itemId: "creator-plan",
        itemTitle: "Creator Plan",
        amount: 1200,
        currency: "JPY",
        status: "succeeded",
      });
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
      if (contentType === "recipe" || contentType === "set") {
        await store.createPurchase(userId, {
          itemType: contentType,
          itemId: contentId,
          itemTitle: contentId,
          amount,
          currency: "JPY",
          status: "succeeded",
        });
      }
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

app.get("/v1/notifications", async (req, res) => {
  try {
    const userId = resolveUserId(req);
    const type = resolveNotificationType(req.query.type);
    const limitRaw = Number(req.query.limit ?? 20);
    const limit = Number.isFinite(limitRaw) ? Math.min(Math.max(Math.trunc(limitRaw), 1), 100) : 20;
    const cursor = typeof req.query.cursor === "string" ? req.query.cursor : null;

    const allItems = await store.listNotifications(userId);
    const filtered = type === "all" ? allItems : allItems.filter((item) => item.type === type);
    const startIndex = cursor ? Math.max(filtered.findIndex((item) => item.id === cursor) + 1, 0) : 0;
    const pageItems = filtered.slice(startIndex, startIndex + limit);
    const hasMore = startIndex + limit < filtered.length;
    const nextCursor = hasMore ? pageItems[pageItems.length - 1]?.id ?? null : null;

    return res.json({
      data: {
        items: pageItems,
        unreadCount: allItems.filter((item) => !item.isRead).length,
        nextCursor,
        hasMore,
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "unknown error";
    return res.status(500).json({ error: message });
  }
});

app.post("/v1/notifications/read", async (req, res) => {
  try {
    const userId = resolveUserId(req);
    const all = req.body?.all === true;
    const notificationIds = Array.isArray(req.body?.notificationIds)
      ? req.body.notificationIds.filter((id: unknown): id is string => typeof id === "string")
      : undefined;
    if (!all && (!notificationIds || notificationIds.length === 0)) {
      return res.status(400).json({ error: "notificationIds(array) or all=true is required" });
    }
    const result = await store.markNotificationsRead(userId, { all, notificationIds });
    return res.json({ data: result });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "unknown error";
    return res.status(500).json({ error: message });
  }
});

app.post("/v1/push-tokens", async (req, res) => {
  try {
    const userId = resolveUserId(req);
    const { token, platform } = req.body ?? {};
    if (typeof token !== "string" || !token.trim()) {
      return res.status(400).json({ error: "token is required" });
    }
    if (platform !== "web") {
      return res.status(400).json({ error: "platform must be web" });
    }
    const registered = await store.upsertPushToken(userId, token.trim(), platform);
    return res.status(201).json({
      data: {
        token: token.trim(),
        registered,
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "unknown error";
    return res.status(500).json({ error: message });
  }
});

app.delete("/v1/push-tokens/:token", async (req, res) => {
  try {
    const userId = resolveUserId(req);
    const deleted = await store.deletePushToken(userId, req.params.token);
    if (!deleted) return res.status(404).json({ error: "Push token not found" });
    return res.json({
      data: {
        token: req.params.token,
        deleted: true,
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "unknown error";
    return res.status(500).json({ error: message });
  }
});

app.get("/v1/notification-settings", async (req, res) => {
  try {
    const userId = resolveUserId(req);
    const settings = await store.getNotificationSettings(userId);
    return res.json({
      data: {
        pushEnabled: settings.pushEnabled,
        categories: settings.categories,
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "unknown error";
    return res.status(500).json({ error: message });
  }
});

app.patch("/v1/notification-settings", async (req, res) => {
  try {
    const userId = resolveUserId(req);
    const patch: {
      pushEnabled?: boolean;
      categories?: { news?: boolean; personal?: boolean };
    } = {};
    if (req.body?.pushEnabled !== undefined) {
      if (typeof req.body.pushEnabled !== "boolean") {
        return res.status(400).json({ error: "pushEnabled must be boolean" });
      }
      patch.pushEnabled = req.body.pushEnabled;
    }
    if (req.body?.categories !== undefined) {
      const input = req.body.categories;
      if (typeof input !== "object" || input === null) {
        return res.status(400).json({ error: "categories must be an object" });
      }
      const categories: { news?: boolean; personal?: boolean } = {};
      if (input.news !== undefined) {
        if (typeof input.news !== "boolean") return res.status(400).json({ error: "categories.news must be boolean" });
        categories.news = input.news;
      }
      if (input.personal !== undefined) {
        if (typeof input.personal !== "boolean") {
          return res.status(400).json({ error: "categories.personal must be boolean" });
        }
        categories.personal = input.personal;
      }
      patch.categories = categories;
    }
    if (patch.pushEnabled === undefined && patch.categories === undefined) {
      return res.status(400).json({ error: "pushEnabled or categories is required" });
    }
    const settings = await store.updateNotificationSettings(userId, patch);
    return res.json({
      data: {
        pushEnabled: settings.pushEnabled,
        categories: settings.categories,
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "unknown error";
    return res.status(500).json({ error: message });
  }
});

// recipes
app.post("/v1/import/parse", async (req, res) => {
  try {
    const { type, content } = req.body ?? {};
    if ((type !== "url" && type !== "text") || typeof content !== "string" || !content.trim()) {
      return res.status(400).json({
        error: "type(url|text) and content(string) are required",
      });
    }

    const parsed = parseImportDraft(type, content.trim());
    return res.json({ data: parsed });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "unknown error";
    return res.status(400).json({
      error: {
        code: "IMPORT_PARSE_FAILED",
        message,
      },
    });
  }
});

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

// catalog
app.get("/v1/catalog/recipes", async (req, res) => {
  try {
    const userId = resolveUserId(req);
    const [items, ownRecipes] = await Promise.all([
      store.listCatalogRecipes(),
      store.listRecipes(userId),
    ]);
    const savedIds = new Set(ownRecipes.filter((recipe) => recipe.origin === "saved").map((recipe) => recipe.id));
    const annotated = items.map((item) => ({ ...item, isSaved: savedIds.has(item.id) }));
    return res.json({ data: { items: annotated } });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "unknown error";
    return res.status(500).json({ error: message });
  }
});

app.get("/v1/catalog/sets", async (req, res) => {
  try {
    const userId = resolveUserId(req);
    const [items, ownSets] = await Promise.all([store.listCatalogSets(), store.listSets(userId)]);
    const savedIds = new Set(ownSets.filter((set) => set.origin === "saved").map((set) => set.id));
    const annotated = items.map((item) => ({ ...item, isSaved: savedIds.has(item.id) }));
    return res.json({ data: { items: annotated } });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "unknown error";
    return res.status(500).json({ error: message });
  }
});

app.get("/v1/catalog/recipes/:id", async (req, res) => {
  try {
    const userId = resolveUserId(req);
    const [item, own] = await Promise.all([
      store.getCatalogRecipe(req.params.id),
      store.getRecipe(userId, req.params.id),
    ]);
    if (!item) return res.status(404).json({ error: "Catalog recipe not found" });
    return res.json({ data: { ...item, isSaved: own?.origin === "saved" } });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "unknown error";
    return res.status(500).json({ error: message });
  }
});

app.get("/v1/catalog/sets/:id", async (req, res) => {
  try {
    const userId = resolveUserId(req);
    const [item, own] = await Promise.all([
      store.getCatalogSet(req.params.id),
      store.getSet(userId, req.params.id),
    ]);
    if (!item) return res.status(404).json({ error: "Catalog set not found" });
    return res.json({ data: { ...item, isSaved: own?.origin === "saved" } });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "unknown error";
    return res.status(500).json({ error: message });
  }
});

app.post("/v1/catalog/recipes/:id/save", async (req, res) => {
  try {
    const userId = resolveUserId(req);
    const saved = await store.saveCatalogRecipe(userId, req.params.id);
    if (!saved) return res.status(404).json({ error: "Catalog recipe not found" });
    return res.json({ data: { recipeId: saved.id, saved: true } });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "unknown error";
    return res.status(500).json({ error: message });
  }
});

app.delete("/v1/catalog/recipes/:id/save", async (req, res) => {
  try {
    const userId = resolveUserId(req);
    const unsaved = await store.unsaveCatalogRecipe(userId, req.params.id);
    if (!unsaved) return res.status(404).json({ error: "Saved catalog recipe not found" });
    return res.json({ data: { recipeId: req.params.id, saved: false } });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "unknown error";
    return res.status(500).json({ error: message });
  }
});

app.post("/v1/catalog/sets/:id/save", async (req, res) => {
  try {
    const userId = resolveUserId(req);
    const saved = await store.saveCatalogSet(userId, req.params.id);
    if (!saved) return res.status(404).json({ error: "Catalog set not found" });
    return res.json({ data: { setId: saved.id, saved: true } });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "unknown error";
    return res.status(500).json({ error: message });
  }
});

app.delete("/v1/catalog/sets/:id/save", async (req, res) => {
  try {
    const userId = resolveUserId(req);
    const unsaved = await store.unsaveCatalogSet(userId, req.params.id);
    if (!unsaved) return res.status(404).json({ error: "Saved catalog set not found" });
    return res.json({ data: { setId: req.params.id, saved: false } });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "unknown error";
    return res.status(500).json({ error: message });
  }
});

app.post("/v1/catalog/recipes/:id/purchase", async (req, res) => {
  try {
    const userId = resolveUserId(req);
    const saved = await store.saveCatalogRecipe(userId, req.params.id);
    if (!saved) return res.status(404).json({ error: "Catalog recipe not found" });
    const purchase = await store.createPurchase(userId, {
      itemType: "recipe",
      itemId: saved.id,
      itemTitle: saved.title,
      amount: 680,
      currency: "JPY",
      status: "succeeded",
    });
    return res.json({
      data: purchase,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "unknown error";
    return res.status(500).json({ error: message });
  }
});

app.post("/v1/catalog/sets/:id/purchase", async (req, res) => {
  try {
    const userId = resolveUserId(req);
    const saved = await store.saveCatalogSet(userId, req.params.id);
    if (!saved) return res.status(404).json({ error: "Catalog set not found" });
    const purchase = await store.createPurchase(userId, {
      itemType: "set",
      itemId: saved.id,
      itemTitle: saved.title,
      amount: 1980,
      currency: "JPY",
      status: "succeeded",
    });
    return res.json({
      data: purchase,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "unknown error";
    return res.status(500).json({ error: message });
  }
});

// share
app.post("/v1/share", async (req, res) => {
  try {
    const { targetType, targetId, authorName, sourceUrl } = req.body ?? {};
    if ((targetType !== "recipe" && targetType !== "set") || typeof targetId !== "string") {
      return res.status(400).json({ error: "targetType(recipe|set) and targetId are required" });
    }

    if (targetType === "recipe") {
      const recipe = await store.getCatalogRecipe(targetId);
      if (!recipe) return res.status(404).json({ error: "Catalog recipe not found" });
      return res.json({
        data: {
          shareUrl: buildShareUrl("recipe", recipe.id),
          targetType: "recipe",
          targetId: recipe.id,
          authorName: authorName ?? recipe.authorName ?? null,
          sourceUrl: sourceUrl ?? recipe.sourceUrl ?? null,
        },
      });
    }

    const set = await store.getCatalogSet(targetId);
    if (!set) return res.status(404).json({ error: "Catalog set not found" });
    return res.json({
      data: {
        shareUrl: buildShareUrl("set", set.id),
        targetType: "set",
        targetId: set.id,
        authorName: authorName ?? set.authorName ?? null,
        sourceUrl: sourceUrl ?? null,
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "unknown error";
    return res.status(500).json({ error: message });
  }
});

app.get("/v1/share/recipe/:id", async (req, res) => {
  try {
    const recipe = await store.getCatalogRecipe(req.params.id);
    if (!recipe) return res.status(404).json({ error: "Shared recipe not found" });
    return res.json({
      data: {
        id: recipe.id,
        title: recipe.title,
        authorName: recipe.authorName,
        sourceUrl: recipe.sourceUrl,
        thumbnailUrl: recipe.thumbnailUrl,
        servings: recipe.servings,
        cookTimeMinutes: recipe.cookTimeMinutes,
        ingredients: recipe.ingredients,
        steps: recipe.steps,
        tags: recipe.tags,
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "unknown error";
    return res.status(500).json({ error: message });
  }
});

app.get("/v1/share/set/:id", async (req, res) => {
  try {
    const set = await store.getCatalogSet(req.params.id);
    if (!set) return res.status(404).json({ error: "Shared set not found" });
    return res.json({
      data: {
        id: set.id,
        title: set.title,
        authorName: set.authorName,
        description: set.description,
        thumbnailUrl: set.thumbnailUrl,
        recipeIds: set.recipeIds,
        tags: set.tags,
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "unknown error";
    return res.status(500).json({ error: message });
  }
});

// categories
app.get("/v1/categories", async (req, res) => {
  try {
    const userId = resolveUserId(req);
    const scope = resolveCategoryScope(req.query.scope);
    if (!scope) {
      return res.status(400).json({ error: "scope(book|catalog) is required" });
    }
    const defaults = buildDefaultCategories(userId, scope);
    const customItems = await store.listCategories(userId, scope);
    const items = [...defaults, ...customItems].sort((a, b) => a.order - b.order);
    return res.json({ data: { items } });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "unknown error";
    return res.status(500).json({ error: message });
  }
});

app.post("/v1/categories", async (req, res) => {
  try {
    const userId = resolveUserId(req);
    const scope = resolveCategoryScope(req.body?.scope);
    const rawTagName = typeof req.body?.tagName === "string" ? req.body.tagName.trim() : "";
    if (!scope || !rawTagName) {
      return res.status(400).json({ error: "scope(book|catalog) and tagName are required" });
    }
    if (rawTagName.length > 30) {
      return res.status(400).json({ error: "tagName must be 30 characters or less" });
    }
    const category = await store.createCategory(userId, scope, rawTagName);
    return res.status(201).json({ data: category });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "unknown error";
    return res.status(500).json({ error: message });
  }
});

app.patch("/v1/categories/:id", async (req, res) => {
  try {
    const userId = resolveUserId(req);
    const categoryId = req.params.id;
    if (categoryId.startsWith("default-")) {
      return res.status(400).json({ error: "Default category cannot be updated" });
    }

    const patch: { tagName?: string; order?: number; isHidden?: boolean } = {};
    if (req.body?.tagName !== undefined) {
      if (typeof req.body.tagName !== "string" || !req.body.tagName.trim()) {
        return res.status(400).json({ error: "tagName must be a non-empty string" });
      }
      if (req.body.tagName.trim().length > 30) {
        return res.status(400).json({ error: "tagName must be 30 characters or less" });
      }
      patch.tagName = req.body.tagName.trim();
    }
    if (req.body?.order !== undefined) {
      if (!Number.isInteger(req.body.order) || req.body.order < 0) {
        return res.status(400).json({ error: "order must be a non-negative integer" });
      }
      patch.order = req.body.order;
    }
    if (req.body?.isHidden !== undefined) {
      if (typeof req.body.isHidden !== "boolean") {
        return res.status(400).json({ error: "isHidden must be boolean" });
      }
      patch.isHidden = req.body.isHidden;
    }

    if (Object.keys(patch).length === 0) {
      return res.status(400).json({ error: "tagName, order, or isHidden is required" });
    }

    const updated = await store.updateCategory(userId, categoryId, patch);
    if (!updated) return res.status(404).json({ error: "Category not found" });
    return res.json({ data: updated });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "unknown error";
    return res.status(500).json({ error: message });
  }
});

app.delete("/v1/categories/:id", async (req, res) => {
  try {
    const userId = resolveUserId(req);
    const categoryId = req.params.id;
    if (categoryId.startsWith("default-")) {
      return res.status(400).json({ error: "Default category cannot be deleted" });
    }
    const deleted = await store.deleteCategory(userId, categoryId);
    if (!deleted) return res.status(404).json({ error: "Category not found" });
    return res.json({ data: { id: categoryId, deleted: true } });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "unknown error";
    return res.status(500).json({ error: message });
  }
});

// archive
app.get("/v1/archive", async (req, res) => {
  try {
    const userId = resolveUserId(req);
    const month = typeof req.query.month === "string" ? req.query.month : "";
    if (!isValidMonth(month)) {
      return res.status(400).json({ error: "month(YYYY-MM) is required" });
    }

    const logs = await store.listCookLogsByMonth(userId, month);
    const dailyCount = new Map<string, number>();
    for (const log of logs) {
      const date = log.createdAt.slice(0, 10);
      dailyCount.set(date, (dailyCount.get(date) ?? 0) + 1);
    }
    const days = Array.from(dailyCount.entries())
      .sort(([a], [b]) => (a < b ? -1 : 1))
      .map(([date, count]) => ({ date, count, hasLogs: count > 0 }));

    return res.json({
      data: {
        month,
        days,
        totalCount: logs.length,
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "unknown error";
    return res.status(500).json({ error: message });
  }
});

app.get("/v1/archive/:date", async (req, res) => {
  try {
    const userId = resolveUserId(req);
    const date = req.params.date;
    if (!isValidDate(date)) {
      return res.status(400).json({ error: "date(YYYY-MM-DD) is required" });
    }
    const logs = await store.listCookLogsByDate(userId, date);
    return res.json({
      data: {
        date,
        logs: logs.map((log) => ({
          id: log.id,
          recipeId: log.recipeId,
          recipeTitle: log.recipeTitle,
          recipeThumbnailUrl: log.recipeThumbnailUrl,
          createdAt: log.createdAt,
        })),
      },
    });
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

app.post("/v1/plan/advance", async (req, res) => {
  try {
    const userId = resolveUserId(req);
    const plan = await store.getPlan(userId);
    if (!plan.next) {
      return res.status(409).json({ error: "Next plan is empty" });
    }

    await store.setPlanSlot(userId, "current", {
      ...plan.next,
      appliedAt: nowIso(),
    });
    await store.clearPlanSlot(userId, "next");

    const updated = await store.getPlan(userId);
    return res.json({ data: updated });
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

app.delete("/v1/shopping-list/items/:id", async (req, res) => {
  try {
    const userId = resolveUserId(req);
    const deleted = await store.deleteShoppingItem(userId, req.params.id);
    if (!deleted) return res.status(404).json({ error: "Shopping item not found" });
    return res.json({ data: { id: req.params.id, deleted: true } });
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

