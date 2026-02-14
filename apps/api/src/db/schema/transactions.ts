import {
  bigint,
  index,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { user } from "./auth";

export const transactionTypeEnum = pgEnum("transaction_type", [
  "subscription_payment", // Pagamento de assinatura
  "payg_topup", // Recarga PAYG
  "payg_charge", // Cobrança PAYG (uso)
  "plan_credit_grant", // Concessão de créditos do plano
  "refund", // Reembolso
  "adjustment", // Ajuste manual
]);

export const transactionStatusEnum = pgEnum("transaction_status", [
  "pending",
  "completed",
  "failed",
  "refunded",
]);

export const transactions = pgTable(
  "transactions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),

    // Tipo e status
    type: transactionTypeEnum("type").notNull(),
    status: transactionStatusEnum("status").notNull().default("pending"),

    // Valores em centavos (positivo = entrada, negativo = saída)
    amountCents: bigint("amount_cents", { mode: "number" }).notNull(),

    // Descrição/razão
    description: text("description"),

    // Stripe IDs (se aplicável)
    stripePaymentIntentId: text("stripe_payment_intent_id"),
    stripeInvoiceId: text("stripe_invoice_id"),
    stripeChargeId: text("stripe_charge_id"),

    // Metadados
    metadata: text("metadata"), // JSON string

    // Timestamps
    processedAt: timestamp("processed_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("transactions_user_id_idx").on(table.userId),
    index("transactions_type_idx").on(table.type),
    index("transactions_status_idx").on(table.status),
    index("transactions_created_at_idx").on(table.createdAt),
  ],
);

export type Transaction = typeof transactions.$inferSelect;
export type NewTransaction = typeof transactions.$inferInsert;