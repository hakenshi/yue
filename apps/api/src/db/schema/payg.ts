import {
  pgTable,
  text,
  timestamp,
  uuid,
  integer,
  bigint,
  uniqueIndex,
} from "drizzle-orm/pg-core";

export const paygSettings = pgTable("payg_settings", {
  userId: text("user_id").primaryKey(),

  topupMode: text("topup_mode").notNull().default("prompt"),
  warnOnLowBalance: integer("warn_on_low_balance").notNull().default(1),

  lowBalanceThresholdUsdCents: integer("low_balance_threshold_usd_cents")
    .notNull()
    .default(500),
  suggestedTopupUsdCents: integer("suggested_topup_usd_cents")
    .notNull()
    .default(1000),
  largeTopupConfirmThresholdUsdCents: integer(
    "large_topup_confirm_threshold_usd_cents",
  )
    .notNull()
    .default(20000),

  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const paygAccount = pgTable("payg_account", {
  userId: text("user_id").primaryKey(),
  balanceMicroCents: bigint("balance_micro_cents", { mode: "bigint" })
    .notNull()
    .default(0n),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const paygLedgerEntry = pgTable(
  "payg_ledger_entry",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id").notNull(),

    direction: text("direction").notNull(),
    reason: text("reason").notNull(),

    amountMicroCents: bigint("amount_micro_cents", {
      mode: "bigint",
    }).notNull(),
    idempotencyKey: text("idempotency_key").notNull(),
    externalRef: text("external_ref"),

    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => ({
    idempotencyKeyUnique: uniqueIndex(
      "payg_ledger_entry_idempotency_key_unique",
    ).on(t.idempotencyKey),
  }),
);

export const paygTopup = pgTable(
  "payg_topup",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id").notNull(),

    amountUsdCents: integer("amount_usd_cents").notNull(),
    amountMicroCents: bigint("amount_micro_cents", {
      mode: "bigint",
    }).notNull(),

    stripeCheckoutSessionId: text("stripe_checkout_session_id").notNull(),
    stripePaymentIntentId: text("stripe_payment_intent_id"),

    status: text("status").notNull().default("created"),
    origin: text("origin").notNull().default("manual"),

    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => ({
    checkoutSessionUnique: uniqueIndex("payg_topup_checkout_session_unique").on(
      t.stripeCheckoutSessionId,
    ),
    paymentIntentUnique: uniqueIndex("payg_topup_payment_intent_unique").on(
      t.stripePaymentIntentId,
    ),
  }),
);

export const paygAutoReloadSettings = pgTable("payg_auto_reload_settings", {
  userId: text("user_id").primaryKey(),

  enabled: integer("enabled").notNull().default(0),
  thresholdUsdCents: integer("threshold_usd_cents").notNull().default(500),
  reloadUsdCents: integer("reload_usd_cents").notNull().default(1000),

  cooldownSeconds: integer("cooldown_seconds").notNull().default(600),
  dailyMaxReloads: integer("daily_max_reloads").notNull().default(3),

  lockedUntil: timestamp("locked_until", { withTimezone: true }),
  lastAttemptAt: timestamp("last_attempt_at", { withTimezone: true }),
  lastSuccessAt: timestamp("last_success_at", { withTimezone: true }),
  lastError: text("last_error"),

  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const paygAutoReloadAttempt = pgTable(
  "payg_auto_reload_attempt",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id").notNull(),

    amountUsdCents: integer("amount_usd_cents").notNull(),
    stripePaymentIntentId: text("stripe_payment_intent_id"),
    stripeIdempotencyKey: text("stripe_idempotency_key").notNull(),
    status: text("status").notNull().default("created"),
    error: text("error"),

    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => ({
    stripeIdempotencyKeyUnique: uniqueIndex(
      "payg_auto_reload_attempt_stripe_idempotency_key_unique",
    ).on(t.stripeIdempotencyKey),
    stripePaymentIntentUnique: uniqueIndex(
      "payg_auto_reload_attempt_stripe_payment_intent_unique",
    ).on(t.stripePaymentIntentId),
  }),
);

export const usageEvent = pgTable(
  "usage_event",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id").notNull(),

    providerId: text("provider_id").notNull(),
    modelId: text("model_id").notNull(),

    inputTokens: integer("input_tokens").notNull(),
    outputTokens: integer("output_tokens").notNull(),
    totalTokens: integer("total_tokens").notNull(),

    costMicroCents: bigint("cost_micro_cents", { mode: "bigint" }).notNull(),
    requestId: text("request_id").notNull(),

    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => ({
    requestIdUnique: uniqueIndex("usage_event_request_id_unique").on(
      t.requestId,
    ),
  }),
);
