/**
 * Catalog Zod Schemas
 * @see API仕様定義書 6.1.18, 6.1.19, 6.1.20
 */

import { z } from "zod";
import { paginationParamsSchema } from "./common";

/**
 * Catalog query params schema
 */
export const catalogQueryParamsSchema = paginationParamsSchema.extend({
  search: z.string().max(100).optional(),
  tag: z.string().max(50).optional(),
  category: z.string().optional(),
  creatorId: z.string().optional(),
  priceRange: z.enum(["free", "paid", "all"]).optional(),
  sort: z.enum(["newest", "popular", "price_asc", "price_desc"]).optional(),
});

/**
 * Catalog purchase input schema
 */
export const catalogPurchaseInputSchema = z.object({
  paymentMethodId: z.string().min(1),
});

/**
 * Type exports
 */
export type CatalogQueryParamsSchema = z.infer<typeof catalogQueryParamsSchema>;
export type CatalogPurchaseInputSchema = z.infer<typeof catalogPurchaseInputSchema>;
