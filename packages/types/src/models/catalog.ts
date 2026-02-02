/**
 * Catalog (レシピカタログ) Models
 * @see API仕様定義書 6.2.28-6.2.37
 */

export type StatusBadgeVariant = "free" | "price" | "purchased" | "membership";

export type StatusBadge = {
  label: string;
  variant: StatusBadgeVariant;
};

export type CatalogRecipe = {
  id: string;
  title: string;
  creatorId: string;
  creatorName: string;
  thumbnailUrl: string | null;
  cookTimeMinutes: number | null;
  tags: string[];
  savedCount: number;
  statusBadges: StatusBadge[];
  isPurchased: boolean;
  isSaved: boolean;
  createdAt: string; // ISO8601
};

export type CatalogSet = {
  id: string;
  title: string;
  creatorId: string;
  creatorName: string;
  description: string | null;
  thumbnailUrl: string | null;
  tags: string[];
  recipeCount: number;
  savedCount: number;
  statusBadges: StatusBadge[];
  isPurchased: boolean;
  isSaved: boolean;
  createdAt: string; // ISO8601
};

export type CatalogSortOption = "newest" | "popular" | "recommended";
export type CatalogStatusFilter = "free" | "paid" | "purchased";
export type CatalogCookTimeFilter = 15 | 30 | 45;

export type CatalogQueryParams = {
  limit?: number;
  cursor?: string;
  search?: string;
  tag?: string;
  sort?: CatalogSortOption;
  status?: CatalogStatusFilter;
  cookTime?: CatalogCookTimeFilter;
  creatorId?: string;
};
