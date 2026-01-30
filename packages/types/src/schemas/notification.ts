/**
 * Notification Zod Schemas
 * @see API仕様定義書 6.1.32, 6.1.33, 6.1.34, 6.1.35, 6.1.36
 */

import { z } from "zod";
import { ulidSchema } from "./common";

/**
 * Notification type enum
 */
export const notificationTypeSchema = z.enum([
  "plan_reminder",
  "shopping_reminder",
  "new_catalog",
  "subscription",
  "system",
]);

/**
 * Notification read input schema
 */
export const notificationReadInputSchema = z.object({
  ids: z.array(ulidSchema).min(1).max(100),
});

/**
 * Push token create input schema
 */
export const pushTokenCreateInputSchema = z.object({
  token: z.string().min(1),
  platform: z.enum(["ios", "android", "web"]),
});

/**
 * Notification settings update input schema
 */
export const notificationSettingsUpdateInputSchema = z.object({
  planReminder: z.boolean().optional(),
  shoppingReminder: z.boolean().optional(),
  newCatalog: z.boolean().optional(),
  subscription: z.boolean().optional(),
  system: z.boolean().optional(),
  reminderTime: z
    .string()
    .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Invalid time format (HH:MM)")
    .optional(),
});

/**
 * Type exports
 */
export type NotificationTypeSchema = z.infer<typeof notificationTypeSchema>;
export type NotificationReadInputSchema = z.infer<typeof notificationReadInputSchema>;
export type PushTokenCreateInputSchema = z.infer<typeof pushTokenCreateInputSchema>;
export type NotificationSettingsUpdateInputSchema = z.infer<typeof notificationSettingsUpdateInputSchema>;
