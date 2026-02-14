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

export const topupStatusEnum = pgEnum("topup_status", [
  "pending",
  "processing",
  "completed",
  "failed",
  "cancelled",
]);

export const paygTopups = pgTable(
  "payg_topups",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),

    // Valor da recarga
    amountCents: bigint("amount_cents", { mode: "number" }).notNull(),

    // Status
    status: topupStatusEnum("status").notNull().default("pending"),

    // Motivo do trigger
    triggerType: text("trigger_type").notNull(), // 'auto_threshold', 'manual', 'admin'
    balanceBeforeCents: bigint("balance_before_cents", { mode: "number" }),
    thresholdCents: bigint("threshold_cents", { mode: "number" }),

    // Stripe
    stripePaymentIntentId: text("stripe_payment_intent_id"),

    // Erro (se falhou)
    errorMessage: text("error_message"),

    // Timestamps
    completedAt: timestamp("completed_at"),
    failedAt: timestamp("failed_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("payg_topups_user_id_idx").on(table.userId),
    index("payg_topups_status_idx").on(table.status),
    index("payg_topups_created_at_idx").on(table.createdAt),
  ],
);

export type PaygTopup = typeof paygTopups.$inferSelect;
export type NewPaygTopup = typeof paygTopups.$inferInsert;


