/**
 * Payment Zod Schemas
 * @see API仕様定義書 6.1.27, 6.1.28, 6.1.29, 6.1.30, 6.1.31
 */

import { z } from "zod";
import { ulidSchema } from "./common";

/**
 * Subscription plan enum
 */
export const subscriptionPlanSchema = z.enum(["user_plus", "creator_plus"]);

/**
 * Payment method create input schema
 */
export const paymentMethodCreateInputSchema = z.object({
  stripePaymentMethodId: z.string().min(1),
  isDefault: z.boolean().optional(),
});

/**
 * Purchase create input schema
 */
export const purchaseCreateInputSchema = z.object({
  productType: z.literal("creator_license"),
  paymentMethodId: ulidSchema,
});

/**
 * Subscription create input schema
 */
export const subscriptionCreateInputSchema = z.object({
  plan: subscriptionPlanSchema,
  paymentMethodId: ulidSchema,
});

/**
 * Type exports
 */
export type SubscriptionPlanSchema = z.infer<typeof subscriptionPlanSchema>;
export type PaymentMethodCreateInputSchema = z.infer<typeof paymentMethodCreateInputSchema>;
export type PurchaseCreateInputSchema = z.infer<typeof purchaseCreateInputSchema>;
export type SubscriptionCreateInputSchema = z.infer<typeof subscriptionCreateInputSchema>;
