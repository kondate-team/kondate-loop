/**
 * Import (レシピ取り込み) Models
 * @see API仕様定義書 6.2.27
 */

import type { Ingredient, RecipeStep } from "./recipe";

export type ImportType = "url" | "text";
export type ImportSource = "json-ld" | "llm";
export type ImportConfidence = "high" | "medium" | "low";

export type RecipeDraft = {
  title: string;
  servings: number;
  ingredients: Omit<Ingredient, "order">[];
  steps: Omit<RecipeStep, "order">[];
  sourceUrl: string | null;
  authorName: string | null;
  cookTimeMinutes: number | null;
  tags: string[];
};

export type ImportParseInput = {
  type: ImportType;
  content: string;
};

export type ImportParseResult = {
  draft: RecipeDraft;
  source: ImportSource;
  confidence: ImportConfidence;
};
