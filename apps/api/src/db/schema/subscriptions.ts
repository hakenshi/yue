import { pgEnum, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { user } from "./auth";

export const subscriptionStatusEnum = pgEnum("subscription_status", [
  "incomplete",
  "incomplete_expired",
  "trialing",
  "active",
  "past_due",
  "canceled",
  "unpaid",
  "paused",
]);

export const subscriptions = pgTable("subscriptions", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id")
    .notNull()
    .unique()
    .references(() => user.id, { onDelete: "cascade" }),

  // Stripe IDs
  stripeCustomerId: text("stripe_customer_id"),
  stripeSubscriptionId: text("stripe_subscription_id"),
  stripePriceId: text("stripe_price_id"),

  // Plano
  planKey: text("plan_key").notNull().default("free"), // free, starter, pro, enterprise

  // Status
  status: subscriptionStatusEnum("status").notNull().default("active"),

  // Período de faturamento
  currentPeriodStart: timestamp("current_period_start"),
  currentPeriodEnd: timestamp("current_period_end"),

  // Cancelamento
  cancelAtPeriodEnd: timestamp("cancel_at_period_end"),
  canceledAt: timestamp("canceled_at"),

  // Metadados
  metadata: text("metadata"), // JSON string para flexibilidade

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type Subscription = typeof subscriptions.$inferSelect;
export type NewSubscription = typeof subscriptions.$inferInsert;

// Export for drizzle-typebox
export const table = {
  subscriptions,
} as const;

export type Table = typeof table;
