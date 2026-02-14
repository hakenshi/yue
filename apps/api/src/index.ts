import { Elysia } from "elysia";
import { cors } from "@elysiajs/cors";

// Import modules
import { stripe } from "./modules/stripe";
import { credits } from "./modules/credits";
import { subscriptions } from "./modules/subscriptions";
import { transactions } from "./modules/transactions";
import { models } from "./modules/models";
import { webhooks } from "./modules/webhooks";
import { auth } from "./lib/better-auth/auth";

export const api = new Elysia({ prefix: "/api/v1" })
  .use(cors())
  .get("/health", () => ({ ok: true }))
  .get("/version", () => ({ name: "yue", api: 1 }))
  .mount(auth.handler)
  .use(stripe)
  .use(credits)
  .use(subscriptions)
  .use(transactions)
  .use(models)
  .use(webhooks);

export type Api = typeof api;
