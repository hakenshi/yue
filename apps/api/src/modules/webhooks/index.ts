import { Elysia, t } from "elysia";
import { WebhooksService } from "./service";
import { WebhooksModel } from "./model";

export { WebhooksService } from "./service";
export { WebhooksModel } from "./model";

export const webhooks = new Elysia({ prefix: "/webhooks" })
  .post("/stripe", ({ body }) => WebhooksService.handleStripeEvent(body), {
    body: WebhooksModel.HandleStripeEvent,
  })
  .post(
    "/stripe/invoice-paid",
    ({ body }) => WebhooksService.handleInvoicePaid(body),
    {
      body: WebhooksModel.HandleInvoicePaid,
    },
  )
  .post(
    "/stripe/invoice-failed",
    ({ body }) => WebhooksService.handleInvoicePaymentFailed(body),
    {
      body: WebhooksModel.HandleInvoicePaymentFailed,
    },
  )
  .post(
    "/stripe/payment-succeeded",
    ({ body }) => WebhooksService.handlePaymentIntentSucceeded(body),
    {
      body: WebhooksModel.HandlePaymentIntentSucceeded,
    },
  )
  .post(
    "/stripe/payment-failed",
    ({ body }) => WebhooksService.handlePaymentIntentPaymentFailed(body),
    {
      body: WebhooksModel.HandlePaymentIntentPaymentFailed,
    },
  )
  .post(
    "/stripe/subscription-updated",
    ({ body }) => WebhooksService.handleCustomerSubscriptionUpdated(body),
    {
      body: WebhooksModel.HandleCustomerSubscriptionUpdated,
    },
  )
  .post(
    "/stripe/subscription-deleted",
    ({ body }) => WebhooksService.handleCustomerSubscriptionDeleted(body),
    {
      body: WebhooksModel.HandleCustomerSubscriptionDeleted,
    },
  )
  .post(
    "/stripe/charge-refunded",
    ({ body }) => WebhooksService.handleChargeRefunded(body),
    {
      body: WebhooksModel.HandleChargeRefunded,
    },
  );
