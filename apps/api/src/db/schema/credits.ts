import {
  bigint,
  boolean,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { user } from "./auth";

export const credits = pgTable("credits", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id")
    .notNull()
    .unique()
    .references(() => user.id, { onDelete: "cascade" }),

  // Saldo PAYG em centavos (ex: 1000 = $10.00)
  paygBalanceCents: bigint("payg_balance_cents", { mode: "number" })
    .notNull()
    .default(0),

  // Créditos do plano restantes (reset mensal)
  planAllowanceRemaining: bigint("plan_allowance_remaining", { mode: "number" })
    .notNull()
    .default(0),

  // Quando os créditos do plano resetam
  planAllowanceResetsAt: timestamp("plan_allowance_resets_at"),

  // Configuração de auto-topup
  autoTopupEnabled: boolean("auto_topup_enabled").notNull().default(false),
  autoTopupThresholdCents: bigint("auto_topup_threshold_cents", {
    mode: "number",
  }).default(500), // $5.00 default
  autoTopupAmountCents: bigint("auto_topup_amount_cents", {
    mode: "number",
  }).default(1000), // $10.00 default

  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type Credits = typeof credits.$inferSelect;
export type NewCredits = typeof credits.$inferInsert;