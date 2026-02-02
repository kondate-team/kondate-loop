/**
 * Category Zod Schemas
 * @see API仕様定義書 6.1.24, 6.1.25, 6.1.26
 */

import { z } from "zod";

/**
 * Category scope enum
 */
export const categoryScopeSchema = z.enum(["recipe", "set"]);

/**
 * Category create input schema
 */
export const categoryCreateInputSchema = z.object({
  name: z.string().min(1).max(50),
  scope: categoryScopeSchema,
  color: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, "Invalid hex color")
    .optional(),
  order: z.number().int().min(0).optional(),
});

/**
 * Category update input schema
 */
export const categoryUpdateInputSchema = z.object({
  name: z.string().min(1).max(50).optional(),
  color: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, "Invalid hex color")
    .optional(),
  order: z.number().int().min(0).optional(),
});

/**
 * Type exports
 */
export type CategoryScopeSchema = z.infer<typeof categoryScopeSchema>;
export type CategoryCreateInputSchema = z.infer<typeof categoryCreateInputSchema>;
export type CategoryUpdateInputSchema = z.infer<typeof categoryUpdateInputSchema>;
