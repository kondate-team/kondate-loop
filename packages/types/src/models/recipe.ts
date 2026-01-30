/**
 * Recipe Models
 * @see API仕様定義書 6.2.17-6.2.21
 */

export type Ingredient = {
  name: string;
  quantity: number;
  unit: string;
  order?: number;
};

export type IntermediateMaterial = {
  title: string;
  text: string;
  order?: number;
};

export type RecipeStep = {
  order?: number;
  text: string;
  timerMinutes?: number | null;
};

export type RecipeOrigin = "created" | "saved";

export type Recipe = {
  id: string;
  title: string;
  authorName: string | null;
  thumbnailUrl: string | null;
  sourceUrl: string | null;
  servings: number;
  cookTimeMinutes: number | null;
  tags: string[];
  ingredients: Ingredient[];
  intermediateMaterials: IntermediateMaterial[];
  steps: RecipeStep[];
  savedCount: number;
  isSaved: boolean;
  origin: RecipeOrigin;
  createdAt: string; // ISO8601
  updatedAt: string; // ISO8601
};

export type RecipeListItem = Pick<
  Recipe,
  | "id"
  | "title"
  | "authorName"
  | "thumbnailUrl"
  | "cookTimeMinutes"
  | "tags"
  | "savedCount"
  | "isSaved"
  | "origin"
  | "createdAt"
>;

export type RecipeCreateInput = {
  title: string;
  servings: number;
  ingredients: Omit<Ingredient, "order">[];
  steps: Omit<RecipeStep, "order">[];
  cookTimeMinutes?: number | null;
  tags?: string[];
  sourceUrl?: string | null;
  authorName?: string | null;
  intermediateMaterials?: Omit<IntermediateMaterial, "order">[];
};

export type RecipeUpdateInput = Partial<RecipeCreateInput>;
