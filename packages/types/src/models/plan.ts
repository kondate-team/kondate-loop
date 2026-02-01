/**
 * Plan (献立表) Models
 * @see API仕様定義書 6.2.3-6.2.6
 */

export type PlanSlot = "current" | "next";

export type PlanItem = {
  id: string;
  recipeId: string;
  title: string;
  thumbnailUrl: string | null;
  isCooked: boolean;
  cookedAt: string | null; // ISO8601
};

export type PlanSlotData = {
  setId: string;
  setTitle: string;
  appliedAt: string; // ISO8601
  items: PlanItem[];
};

export type Plan = {
  current: PlanSlotData | null;
  next: PlanSlotData | null;
};

export type PlanSelectSetInput = {
  setId: string;
  slot: PlanSlot;
};

export type PlanItemUpdateInput = {
  isCooked: boolean;
};
