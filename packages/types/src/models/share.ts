/**
 * Share (外部共有) Models
 * @see API仕様定義書 6.2.38-6.2.40
 */

export type ShareTargetType = "recipe" | "set";

export type ShareCreateInput = {
  targetType: ShareTargetType;
  targetId: string;
  authorName?: string | null;
  sourceUrl?: string | null;
};

export type ShareResult = {
  shareUrl: string;
  targetType: ShareTargetType;
  targetId: string;
  authorName: string | null;
  sourceUrl: string | null;
};

export type SharedRecipe = {
  id: string;
  title: string;
  authorName: string | null;
  sourceUrl: string | null;
  thumbnailUrl: string | null;
  servings: number;
  cookTimeMinutes: number | null;
  ingredients: { name: string; quantity: number; unit: string }[];
  steps: { text: string }[];
  tags: string[];
};

export type SharedSet = {
  id: string;
  title: string;
  authorName: string | null;
  description: string | null;
  thumbnailUrl: string | null;
  recipes: { id: string; title: string; thumbnailUrl: string | null }[];
  tags: string[];
};
