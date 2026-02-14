import { db } from "@/db/client";
import { stripe } from "@better-auth/stripe/*";
import { betterAuth } from "better-auth/*";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import Stripe from "stripe";

const stripeClient = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-01-28.clover",
});

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
  }),
  basePath: "/api/v1",
  plugins: [
    stripe({
      stripeClient,
      stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET!,
      createCustomerOnSignUp: true,
    }),
  ],
});
