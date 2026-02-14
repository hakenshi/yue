import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { user } from "./auth";

export const stripeCustomers = pgTable("stripe_customers", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id")
    .notNull()
    .unique()
    .references(() => user.id, { onDelete: "cascade" }),

  // Stripe Customer ID
  stripeCustomerId: text("stripe_customer_id").notNull().unique(),

  // Dados do cliente no Stripe
  email: text("email"),
  name: text("name"),

  // Metadados
  metadata: text("metadata"), // JSON string

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type StripeCustomer = typeof stripeCustomers.$inferSelect;
export type NewStripeCustomer = typeof stripeCustomers.$inferInsert;

// Export for drizzle-typebox
export const table = {
  stripeCustomers,
} as const;

export type Table = typeof table;
