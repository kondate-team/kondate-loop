/**
 * Share Zod Schemas
 * @see API仕様定義書 6.1.21
 */

import { z } from "zod";
import { ulidSchema } from "./common";

/**
 * Share target type enum
 */
export const shareTargetTypeSchema = z.enum(["recipe", "set"]);

/**
 * Share create input schema
 */
export const shareCreateInputSchema = z.object({
  targetType: shareTargetTypeSchema,
  targetId: ulidSchema,
  expiresInDays: z.number().int().min(1).max(30).optional(),
});

/**
 * Type exports
 */
export type ShareTargetTypeSchema = z.infer<typeof shareTargetTypeSchema>;
export type ShareCreateInputSchema = z.infer<typeof shareCreateInputSchema>;
