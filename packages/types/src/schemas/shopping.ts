/**
 * Shopping List Zod Schemas
 * @see API仕様定義書 6.1.10, 6.1.11, 6.1.12
 */

import { z } from "zod";

/**
 * Shopping item create input schema
 */
export const shoppingItemCreateInputSchema = z.object({
  name: z.string().min(1).max(100),
  amount: z.string().max(50).optional(),
  isManual: z.boolean().default(true),
});

/**
 * Shopping item update input schema
 */
export const shoppingItemUpdateInputSchema = z.object({
  checked: z.boolean(),
});

/**
 * Type exports
 */
export type ShoppingItemCreateInputSchema = z.infer<typeof shoppingItemCreateInputSchema>;
export type ShoppingItemUpdateInputSchema = z.infer<typeof shoppingItemUpdateInputSchema>;
