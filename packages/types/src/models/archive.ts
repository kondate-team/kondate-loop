/**
 * Archive (料理ログ) Models
 * @see API仕様定義書 6.2.45-6.2.46
 */

export type CookingLog = {
  id: string;
  recipeId: string;
  recipeTitle: string;
  recipeThumbnailUrl: string | null;
  createdAt: string; // ISO8601
};

export type ArchiveDay = {
  date: string; // YYYY-MM-DD
  count: number;
  hasLogs: boolean;
};

export type ArchiveMonth = {
  month: string; // YYYY-MM
  days: ArchiveDay[];
  totalCount: number;
};

export type ArchiveDayDetail = {
  date: string; // YYYY-MM-DD
  logs: CookingLog[];
};
