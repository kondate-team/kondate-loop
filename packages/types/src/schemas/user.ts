/**
 * User Zod Schemas
 * @see API仕様定義書 6.0.2, 6.0.3
 */

import { z } from "zod";
import { imageUrlSchema } from "./common";

/**
 * User role enum
 */
export const userRoleSchema = z.enum(["user", "user_plus", "creator", "creator_plus"]);

/**
 * User update input schema (PATCH /v1/me)
 */
export const userUpdateInputSchema = z.object({
  name: z.string().min(1).max(50).optional(),
  avatarUrl: imageUrlSchema.optional(),
});

/**
 * Type exports
 */
export type UserRoleSchema = z.infer<typeof userRoleSchema>;
export type UserUpdateInputSchema = z.infer<typeof userUpdateInputSchema>;
