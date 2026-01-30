/**
 * Recipe Zod Schemas
 * @see API仕様定義書 6.1.5, 6.1.6
 */

import { z } from "zod";
import { imageUrlSchema, urlSchema } from "./common";

/**
 * Ingredient schema
 */
export const ingredientSchema = z.object({
  name: z.string().min(1).max(100),
  amount: z.string().max(50).optional(),
});

/**
 * Recipe step schema
 */
export const recipeStepSchema = z.object({
  order: z.number().int().min(1),
  description: z.string().min(1).max(1000),
  imageUrl: imageUrlSchema.optional(),
});

/**
 * Recipe create input schema
 */
export const recipeCreateInputSchema = z.object({
  title: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  imageUrl: imageUrlSchema.optional(),
  servings: z.number().int().min(1).max(99).optional(),
  cookingTime: z.number().int().min(1).max(999).optional(),
  ingredients: z.array(ingredientSchema).max(100).optional(),
  steps: z.array(recipeStepSchema).max(50).optional(),
  memo: z.string().max(2000).optional(),
  sourceUrl: urlSchema.optional(),
  tags: z.array(z.string().max(30)).max(20).optional(),
  categoryId: z.string().optional(),
});

/**
 * Recipe update input schema
 */
export const recipeUpdateInputSchema = recipeCreateInputSchema.partial();

/**
 * Type exports
 */
export type IngredientInput = z.infer<typeof ingredientSchema>;
export type RecipeStepInput = z.infer<typeof recipeStepSchema>;
export type RecipeCreateInputSchema = z.infer<typeof recipeCreateInputSchema>;
export type RecipeUpdateInputSchema = z.infer<typeof recipeUpdateInputSchema>;
