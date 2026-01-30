/**
 * Common Zod Schemas
 * @see API仕様定義書 6.0
 */

import { z } from "zod";

/**
 * ULID format validation
 */
export const ulidSchema = z.string().regex(/^[0-9A-HJKMNP-TV-Z]{26}$/, "Invalid ULID format");

/**
 * ISO 8601 datetime string
 */
export const datetimeSchema = z.string().datetime();

/**
 * Pagination params
 */
export const paginationParamsSchema = z.object({
  limit: z.number().int().min(1).max(100).optional(),
  cursor: z.string().optional(),
});

/**
 * List query params
 */
export const listQueryParamsSchema = paginationParamsSchema.extend({
  search: z.string().max(100).optional(),
  tag: z.string().max(50).optional(),
  sort: z.enum(["newest", "oldest", "popular"]).optional(),
});

/**
 * URL validation
 */
export const urlSchema = z.string().url();

/**
 * Image URL validation (allows data URIs for base64)
 */
export const imageUrlSchema = z.string().refine(
  (val) => val.startsWith("http://") || val.startsWith("https://") || val.startsWith("data:image/"),
  "Must be a valid URL or data URI"
);
