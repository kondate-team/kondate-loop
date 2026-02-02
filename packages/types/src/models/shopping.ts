/**
 * Shopping List Models
 * @see API仕様定義書 6.2.7-6.2.10
 */

export type ShoppingItemSource = "auto" | "manual";

export type ShoppingItem = {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  checked: boolean;
  source: ShoppingItemSource;
};

export type ShoppingList = {
  items: ShoppingItem[];
};

export type ShoppingItemCreateInput = {
  name: string;
  quantity: number;
  unit: string;
};

export type ShoppingItemUpdateInput = {
  checked: boolean;
};

export type ShoppingCompleteResult = {
  movedToFridge: number;
  remaining: number;
};
