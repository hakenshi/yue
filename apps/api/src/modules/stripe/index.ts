import { Elysia, t } from "elysia";
import { StripeService } from "./service";
import { StripeModel } from "./model";

export { StripeService } from "./service";
export { StripeModel } from "./model";

export const stripe = new Elysia({ prefix: "/stripe" })
  .post("/customers", ({ body }) => StripeService.createCustomer(body), {
    body: StripeModel.CreateCustomer,
  })
  .post(
    "/payment-intents",
    ({ body }) => StripeService.createPaymentIntent(body),
    {
      body: StripeModel.CreatePaymentIntent,
    },
  )
  .post(
    "/subscriptions",
    ({ body }) => StripeService.createSubscription(body),
    {
      body: StripeModel.CreateSubscription,
    },
  )
  .post(
    "/subscriptions/:id/cancel",
    ({ params }) =>
      StripeService.cancelSubscription({ subscriptionId: params.id }),
    {
      params: t.Object({ id: t.String() }),
    },
  )
  .post(
    "/payment-methods/attach",
    ({ body }) => StripeService.attachPaymentMethod(body),
    {
      body: StripeModel.AttachPaymentMethod,
    },
  )
  .post(
    "/payment-methods/default",
    ({ body }) => StripeService.setDefaultPaymentMethod(body),
    {
      body: StripeModel.SetDefaultPaymentMethod,
    },
  );
