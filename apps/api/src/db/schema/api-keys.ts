import {
  pgTable,
  text,
  timestamp,
  uuid,
  uniqueIndex,
} from "drizzle-orm/pg-core";

export const apiKey = pgTable(
  "api_key",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id").notNull(),

    name: text("name").notNull(),
    kid: text("kid").notNull(), // Key ID (the part before _ in yue_<kid>_<secret>)
    secretHash: text("secret_hash").notNull(), // Hashed secret
    scopes: text("scopes").notNull().default("[]"), // JSON array of scopes

    lastUsedAt: timestamp("last_used_at", { withTimezone: true }),
    revokedAt: timestamp("revoked_at", { withTimezone: true }),

    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => ({
    kidUnique: uniqueIndex("api_key_kid_unique").on(t.kid),
  }),
);

export const apiKeyUsage = pgTable("api_key_usage", {
  id: uuid("id").primaryKey().defaultRandom(),
  apiKeyId: text("api_key_id").notNull(),

  endpoint: text("endpoint").notNull(),
  method: text("method").notNull(),
  statusCode: text("status_code").notNull(),

  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});
