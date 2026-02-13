import {
  pgTable,
  text,
  timestamp,
  uuid,
  uniqueIndex,
  integer,
} from "drizzle-orm/pg-core";

export const providerConnection = pgTable(
  "provider_connection",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id").notNull(),
    providerId: text("provider_id").notNull(),

    enabled: integer("enabled").notNull().default(1),
    status: text("status").notNull().default("disconnected"),
    labelOverride: text("label_override"),
    connectedAt: timestamp("connected_at", { withTimezone: true }),
    lastCheckedAt: timestamp("last_checked_at", { withTimezone: true }),
    lastError: text("last_error"),

    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => ({
    userProviderUnique: uniqueIndex(
      "provider_connection_user_provider_unique",
    ).on(t.userId, t.providerId),
  }),
);

export const providerRateLimitSnapshot = pgTable(
  "provider_rate_limit_snapshot",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id").notNull(),
    providerId: text("provider_id").notNull(),
    modelId: text("model_id"),
    scopeKey: text("scope_key").notNull().default("account"),

    requestsLimit: integer("requests_limit"),
    requestsRemaining: integer("requests_remaining"),
    requestsResetAt: timestamp("requests_reset_at", { withTimezone: true }),

    tokensLimit: integer("tokens_limit"),
    tokensRemaining: integer("tokens_remaining"),
    tokensResetAt: timestamp("tokens_reset_at", { withTimezone: true }),

    observedAt: timestamp("observed_at", { withTimezone: true }).notNull(),
  },
  (t) => ({
    snapshotUnique: uniqueIndex("provider_rate_limit_snapshot_unique").on(
      t.userId,
      t.providerId,
      t.modelId,
      t.scopeKey,
    ),
  }),
);
