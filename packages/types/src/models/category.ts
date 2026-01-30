/**
 * Category Models
 * @see API仕様定義書 6.2.41-6.2.44
 */

export type CategoryScope = "book" | "catalog";

export type Category = {
  id: string;
  tagName: string;
  order: number;
  isDefault: boolean;
  isHidden: boolean;
  colorTheme: string | null;
};

export type CategoryCreateInput = {
  scope: CategoryScope;
  tagName: string;
};

export type CategoryUpdateInput = {
  tagName?: string;
  order?: number;
  isHidden?: boolean;
};
