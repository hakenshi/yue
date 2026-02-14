import {
  bigint,
  index,
  integer,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { user } from "./auth";
import { transactions } from "./transactions";

export const usageEvents = pgTable(
  "usage_events",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),

    // Modelo utilizado
    modelId: text("model_id").notNull(), // ex: 'gpt-4', 'claude-3-opus'

    // Tokens consumidos
    promptTokens: integer("prompt_tokens").notNull().default(0),
    completionTokens: integer("completion_tokens").notNull().default(0),
    totalTokens: integer("total_tokens").notNull().default(0),

    // Custo calculado (em centavos)
    costCents: bigint("cost_cents", { mode: "number" }).notNull().default(0),

    // Tipo de consumo
    consumedFrom: text("consumed_from").notNull(), // 'plan_allowance', 'payg_balance'

    // Referência à transação PAYG (se aplicável)
    transactionId: uuid("transaction_id").references(() => transactions.id, {
      onDelete: "set null",
    }),

    // Metadados
    metadata: text("metadata"), // JSON string

    // Timestamps
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("usage_events_user_id_idx").on(table.userId),
    index("usage_events_model_id_idx").on(table.modelId),
    index("usage_events_created_at_idx").on(table.createdAt),
    index("usage_events_user_created_idx").on(table.userId, table.createdAt),
  ],
);

export type UsageEvent = typeof usageEvents.$inferSelect;
export type NewUsageEvent = typeof usageEvents.$inferInsert;