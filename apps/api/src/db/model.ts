import { schema } from "./schema";
import { spreads } from "./utils";

/**
 * Database model singleton for Elysia validation
 * Usage:
 *   import { db } from './model'
 *   db.insert.credits  // TypeBox schema for insert
 *   db.select.credits  // TypeBox schema for select
 */
export const db = {
  insert: spreads(
    {
      // Auth
      user: schema.user,
      session: schema.session,
      account: schema.account,
      verification: schema.verification,

      // Billing
      credits: schema.credits,
      subscriptions: schema.subscriptions,
      transactions: schema.transactions,
      paygTopups: schema.paygTopups,
      paymentMethods: schema.paymentMethods,
      stripeCustomers: schema.stripeCustomers,

      // Usage
      usageEvents: schema.usageEvents,
      usageDailyRollups: schema.usageDailyRollups,
    },
    "insert",
  ),
  select: spreads(
    {
      // Auth
      user: schema.user,
      session: schema.session,
      account: schema.account,
      verification: schema.verification,

      // Billing
      credits: schema.credits,
      subscriptions: schema.subscriptions,
      transactions: schema.transactions,
      paygTopups: schema.paygTopups,
      paymentMethods: schema.paymentMethods,
      stripeCustomers: schema.stripeCustomers,

      // Usage
      usageEvents: schema.usageEvents,
      usageDailyRollups: schema.usageDailyRollups,
    },
    "select",
  ),
} as const;

export type Db = typeof db;
