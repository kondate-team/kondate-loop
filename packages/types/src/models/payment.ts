/**
 * Payment Models
 * @see API仕様定義書 6.2.47-6.2.54
 */

export type PaymentMethodBrand = "visa" | "mastercard" | "amex" | "jcb" | "diners" | "discover" | "unionpay" | "unknown";

export type PaymentMethod = {
  id: string; // Stripe PaymentMethod ID (pm_xxx)
  brand: PaymentMethodBrand;
  last4: string;
  expMonth: number;
  expYear: number;
  isDefault: boolean;
};

export type PaymentMethodCreateInput = {
  paymentMethodId: string; // Stripe.js で作成した pm_xxx
};

export type PurchaseItemType = "recipe" | "set";
export type PurchaseStatus = "succeeded" | "failed" | "pending";

export type Purchase = {
  purchaseId: string;
  itemType: PurchaseItemType;
  itemId: string;
  itemTitle: string;
  amount: number;
  currency: "JPY";
  status: PurchaseStatus;
  purchasedAt: string; // ISO8601
};

export type PurchaseCreateInput = {
  itemType: PurchaseItemType;
  itemId: string;
  paymentMethodId: string;
};

export type SubscriptionPlanId = "user_plus" | "creator_plus";
export type SubscriptionStatus = "active" | "canceling" | "canceled" | "past_due";

export type Subscription = {
  subscriptionId: string;
  planId: SubscriptionPlanId;
  status: SubscriptionStatus;
  currentPeriodEnd: string; // ISO8601
};

export type SubscriptionCreateInput = {
  planId: SubscriptionPlanId;
  paymentMethodId: string;
};
