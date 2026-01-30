/**
 * Fridge Zod Schemas
 * @see API仕様定義書 6.1.13, 6.1.14, 6.1.15, 6.1.16
 */

import { z } from "zod";

/**
 * Fridge item create input schema
 */
export const fridgeItemCreateInputSchema = z.object({
  name: z.string().min(1).max(100),
  quantity: z.string().max(50).optional(),
  note: z.string().max(200).optional(),
});

/**
 * Fridge item update input schema
 */
export const fridgeItemUpdateInputSchema = z.object({
  quantity: z.string().max(50).optional(),
  note: z.string().max(200).optional(),
});

/**
 * Type exports
 */
export type FridgeItemCreateInputSchema = z.infer<typeof fridgeItemCreateInputSchema>;
export type FridgeItemUpdateInputSchema = z.infer<typeof fridgeItemUpdateInputSchema>;
