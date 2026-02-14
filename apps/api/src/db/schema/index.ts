import { credits } from "./credits";
import { account, session, user, verification } from "./auth";
import { paygTopups } from "./payg-topups";
import { paymentMethods } from "./payment-methods";
import { stripeCustomers } from "./stripe-customers";
import { transactions } from "./transactions";
import { subscriptions } from "./subscriptions";
import { usageDailyRollups } from "./usage-daily-rollups";
import { usageEvents } from "./usage-events";

// Export for drizzle-typebox
export const schema = {
  paygTopups,
  user,
  session,
  account,
  verification,
  credits,
  paymentMethods,
  stripeCustomers,
  transactions,
  subscriptions,
  usageEvents,
  usageDailyRollups,
} as const;

export type Schema = typeof schema;
