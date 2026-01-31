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
