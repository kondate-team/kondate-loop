/**
 * Common API Types
 * @see API仕様定義書 6.0
 */

/**
 * Standard API Response wrapper
 */
export type ApiResponse<T> = {
  data: T;
};

/**
 * Paginated response wrapper
 */
export type PaginatedResponse<T> = {
  data: {
    items: T[];
    nextCursor: string | null;
    hasMore: boolean;
  };
};

/**
 * Standard pagination params
 */
export type PaginationParams = {
  limit?: number;
  cursor?: string;
};

/**
 * Standard list query params
 */
export type ListQueryParams = PaginationParams & {
  search?: string;
  tag?: string;
  sort?: "newest" | "oldest" | "popular";
};

/**
 * API Error response
 */
export type ApiErrorDetail = {
  field: string;
  message: string;
};

export type ApiError = {
  error: {
    code: string;
    message: string;
    details?: ApiErrorDetail[];
  };
};
