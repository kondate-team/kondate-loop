import { apiFetch } from "./client"

type RegisterPaymentMethodResponse = {
  ok: boolean
  customerId: string
  paymentMethodId: string
  card: {
    brand: string
    last4: string
    exp_month: number
    exp_year: number
  } | null
}

type CreateSubscriptionResponse = {
  ok: boolean
  subscriptionId: string
  status: string
  clientSecret: string | null
}

type CancelSubscriptionResponse = {
  ok: boolean
  subscription: {
    id: string
    status: string
    cancel_at_period_end: boolean
  }
}

/**
 * カード情報を登録する
 */
export async function registerPaymentMethod(params: {
  userId: string
  email: string
  paymentMethodId: string
}): Promise<RegisterPaymentMethodResponse> {
  return apiFetch<RegisterPaymentMethodResponse>("/v1/payment-methods", {
    method: "POST",
    body: JSON.stringify(params),
  })
}

/**
 * サブスクリプションを作成する
 */
export async function createSubscription(params: {
  userId: string
  priceId?: string
}): Promise<CreateSubscriptionResponse> {
  return apiFetch<CreateSubscriptionResponse>("/v1/subscriptions", {
    method: "POST",
    body: JSON.stringify(params),
  })
}

/**
 * サブスクリプションを解約する（期間末）
 */
export async function cancelSubscription(params: {
  userId: string
}): Promise<CancelSubscriptionResponse> {
  return apiFetch<CancelSubscriptionResponse>("/v1/subscriptions", {
    method: "DELETE",
    body: JSON.stringify(params),
  })
}

// =====================
// プラン購入（買い切り）
// =====================

type PurchasePlanResponse = {
  ok: boolean
  status: string
  paymentIntentId?: string
  plan?: string
  clientSecret?: string
}

/**
 * プランを購入する（買い切り）
 */
export async function purchasePlan(params: {
  userId: string
  planId: string
}): Promise<PurchasePlanResponse> {
  return apiFetch<PurchasePlanResponse>("/v1/purchases/plan", {
    method: "POST",
    body: JSON.stringify(params),
  })
}

// =====================
// Stripe Connect
// =====================

type ConnectAccountResponse = {
  ok: boolean
  accountId: string
  chargesEnabled: boolean
  payoutsEnabled: boolean
  detailsSubmitted: boolean
  requirements?: {
    currently_due: string[]
    eventually_due: string[]
    past_due: string[]
  }
}

type AccountLinkResponse = {
  ok: boolean
  url: string
  expiresAt: number
}

type LoginLinkResponse = {
  ok: boolean
  url: string
}

/**
 * Connect Accountを作成する
 */
export async function createConnectAccount(params: {
  userId: string
  email: string
}): Promise<ConnectAccountResponse> {
  return apiFetch<ConnectAccountResponse>("/v1/connect/accounts", {
    method: "POST",
    body: JSON.stringify(params),
  })
}

/**
 * オンボーディングURLを取得する
 */
export async function createConnectAccountLink(params: {
  userId: string
  returnUrl?: string
  refreshUrl?: string
}): Promise<AccountLinkResponse> {
  return apiFetch<AccountLinkResponse>("/v1/connect/account-links", {
    method: "POST",
    body: JSON.stringify(params),
  })
}

/**
 * Connect Accountの状態を取得する
 */
export async function getConnectAccountStatus(
  userId: string
): Promise<ConnectAccountResponse> {
  return apiFetch<ConnectAccountResponse>(`/v1/connect/accounts/${userId}`, {
    method: "GET",
  })
}

/**
 * Expressダッシュボードへのリンクを取得する
 */
export async function createConnectLoginLink(params: {
  userId: string
}): Promise<LoginLinkResponse> {
  return apiFetch<LoginLinkResponse>("/v1/connect/login-links", {
    method: "POST",
    body: JSON.stringify(params),
  })
}

// =====================
// コンテンツ購入
// =====================

type PurchaseContentResponse = {
  ok: boolean
  status: string
  paymentIntentId?: string
  amount?: number
  platformFee?: number
  creatorReceives?: number
  clientSecret?: string
}

/**
 * 有料コンテンツを購入する
 */
export async function purchaseContent(params: {
  userId: string
  creatorId: string
  contentType: "recipe" | "set" | "membership"
  contentId: string
  amount: number
}): Promise<PurchaseContentResponse> {
  return apiFetch<PurchaseContentResponse>("/v1/purchases/content", {
    method: "POST",
    body: JSON.stringify(params),
  })
}
