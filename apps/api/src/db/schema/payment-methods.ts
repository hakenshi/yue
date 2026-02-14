import {
  boolean,
  index,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { user } from "./auth";

export const paymentMethodTypeEnum = pgEnum("payment_method_type", [
  "card",
  "bank_transfer",
  "paypal",
  "other",
]);

export const paymentMethods = pgTable(
  "payment_methods",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),

    // Stripe Payment Method ID
    stripePaymentMethodId: text("stripe_payment_method_id").notNull(),

    // Tipo
    type: paymentMethodTypeEnum("type").notNull().default("card"),

    // Dados do método (últimos 4 dígitos, etc)
    last4: text("last4"),
    brand: text("brand"), // visa, mastercard, etc
    expMonth: text("exp_month"),
    expYear: text("exp_year"),

    // Status
    isDefault: boolean("is_default").notNull().default(false),

    // Metadados
    billingDetails: text("billing_details"), // JSON string

    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    index("payment_methods_user_id_idx").on(table.userId),
    index("payment_methods_stripe_id_idx").on(table.stripePaymentMethodId),
  ],
);

export type PaymentMethod = typeof paymentMethods.$inferSelect;
export type NewPaymentMethod = typeof paymentMethods.$inferInsert;