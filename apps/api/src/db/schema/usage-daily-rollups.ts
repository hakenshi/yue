import {
  bigint,
  index,
  integer,
  pgTable,
  text,
  date,
  uuid,
} from "drizzle-orm/pg-core";
import { user } from "./auth";

export const usageDailyRollups = pgTable(
  "usage_daily_rollups",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),

    // Data do rollup
    date: date("date").notNull(),

    // Modelo
    modelId: text("model_id").notNull(),

    // Totais do dia
    totalRequests: integer("total_requests").notNull().default(0),
    totalPromptTokens: integer("total_prompt_tokens").notNull().default(0),
    totalCompletionTokens: integer("total_completion_tokens")
      .notNull()
      .default(0),
    totalTokens: integer("total_tokens").notNull().default(0),

    // Custos
    planAllowanceCostCents: bigint("plan_allowance_cost_cents", {
      mode: "number",
    }).default(0),
    paygCostCents: bigint("payg_cost_cents", { mode: "number" }).default(0),
    totalCostCents: bigint("total_cost_cents", { mode: "number" }).default(0),

    // Timestamps
    createdAt: date("created_at").defaultNow().notNull(),
    updatedAt: date("updated_at").defaultNow().notNull(),
  },
  (table) => [
    index("usage_daily_rollups_user_id_idx").on(table.userId),
    index("usage_daily_rollups_date_idx").on(table.date),
    index("usage_daily_rollups_model_idx").on(table.modelId),
    index("usage_daily_rollups_user_date_idx").on(table.userId, table.date),
    index("usage_daily_rollups_unique_idx").on(
      table.userId,
      table.date,
      table.modelId,
    ),
  ],
);

export type UsageDailyRollup = typeof usageDailyRollups.$inferSelect;
export type NewUsageDailyRollup = typeof usageDailyRollups.$inferInsert;