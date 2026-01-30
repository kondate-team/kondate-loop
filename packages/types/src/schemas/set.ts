/**
 * Recipe Set Zod Schemas
 * @see API仕様定義書 6.1.8, 6.1.9
 */

import { z } from "zod";
import { ulidSchema, imageUrlSchema } from "./common";

/**
 * Recipe set create input schema
 */
export const recipeSetCreateInputSchema = z.object({
  title: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  imageUrl: imageUrlSchema.optional(),
  recipeIds: z.array(ulidSchema).min(1).max(10),
  tags: z.array(z.string().max(30)).max(20).optional(),
  categoryId: z.string().optional(),
});

/**
 * Recipe set update input schema
 */
export const recipeSetUpdateInputSchema = recipeSetCreateInputSchema.partial();

/**
 * Type exports
 */
export type RecipeSetCreateInputSchema = z.infer<typeof recipeSetCreateInputSchema>;
export type RecipeSetUpdateInputSchema = z.infer<typeof recipeSetUpdateInputSchema>;
