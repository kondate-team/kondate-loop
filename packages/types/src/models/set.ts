/**
 * RecipeSet Models
 * @see API仕様定義書 6.2.22-6.2.26
 */

import type { RecipeOrigin, RecipeListItem } from "./recipe";

export type RecipeSet = {
  id: string;
  title: string;
  authorName: string | null;
  description: string | null;
  thumbnailUrl: string | null;
  tags: string[];
  recipeIds: string[];
  recipes?: Pick<RecipeListItem, "id" | "title" | "thumbnailUrl">[];
  savedCount: number;
  isSaved: boolean;
  origin: RecipeOrigin;
  createdAt: string; // ISO8601
  updatedAt: string; // ISO8601
};

export type RecipeSetListItem = Omit<RecipeSet, "recipes">;

export type RecipeSetCreateInput = {
  title: string;
  recipeIds: string[];
  description?: string | null;
  tags?: string[];
};

export type RecipeSetUpdateInput = Partial<RecipeSetCreateInput>;
