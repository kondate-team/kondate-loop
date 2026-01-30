/**
 * Fridge (冷蔵庫) Models
 * @see API仕様定義書 6.2.11-6.2.16
 */

export type FridgeItemSource = "auto" | "manual";

export type FridgeItem = {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  note: string | null;
  source: FridgeItemSource;
  updatedAt: string; // ISO8601
};

export type DeletedFridgeItem = {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  deletedAt: string; // ISO8601
};

export type Fridge = {
  items: FridgeItem[];
};

export type FridgeItemCreateInput = {
  name: string;
  quantity: number;
  unit: string;
  note?: string | null;
};

export type FridgeItemUpdateInput = {
  quantity?: number;
  note?: string | null;
};
