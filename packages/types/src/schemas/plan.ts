/**
 * Plan Zod Schemas
 * @see API仕様定義書 6.1.1, 6.1.2, 6.1.3
 */

import { z } from "zod";
import { ulidSchema } from "./common";

/**
 * Plan slot enum
 */
export const planSlotSchema = z.enum(["current", "next"]);

/**
 * Plan select set input schema
 */
export const planSelectSetInputSchema = z.object({
  slot: planSlotSchema,
  setId: ulidSchema,
});

/**
 * Plan item update input schema
 */
export const planItemUpdateInputSchema = z.object({
  isCooked: z.boolean(),
});

/**
 * Type exports
 */
export type PlanSlotSchema = z.infer<typeof planSlotSchema>;
export type PlanSelectSetInputSchema = z.infer<typeof planSelectSetInputSchema>;
export type PlanItemUpdateInputSchema = z.infer<typeof planItemUpdateInputSchema>;
