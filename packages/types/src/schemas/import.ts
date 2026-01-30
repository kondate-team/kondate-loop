/**
 * Import Zod Schemas
 * @see API仕様定義書 6.1.17
 */

import { z } from "zod";
import { urlSchema } from "./common";

/**
 * Import type enum
 */
export const importTypeSchema = z.enum(["recipe", "set"]);

/**
 * Import parse input schema
 */
export const importParseInputSchema = z.object({
  url: urlSchema,
  type: importTypeSchema.default("recipe"),
});

/**
 * Type exports
 */
export type ImportTypeSchema = z.infer<typeof importTypeSchema>;
export type ImportParseInputSchema = z.infer<typeof importParseInputSchema>;
