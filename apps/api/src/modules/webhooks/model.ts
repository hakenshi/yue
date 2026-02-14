import { t } from "elysia";

export namespace WebhooksModel {
  export const HandleStripeEvent = t.Object({
    payload: t.Unknown(),
    signature: t.String(),
  });
  export type HandleStripeEvent = typeof HandleStripeEvent.static;

  export const HandleInvoicePaid = t.Object({
    event: t.Unknown(),
  });
  export type HandleInvoicePaid = typeof HandleInvoicePaid.static;

  export const HandleInvoicePaymentFailed = t.Object({
    event: t.Unknown(),
  });
  export type HandleInvoicePaymentFailed =
    typeof HandleInvoicePaymentFailed.static;

  export const HandlePaymentIntentSucceeded = t.Object({
    event: t.Unknown(),
  });
  export type HandlePaymentIntentSucceeded =
    typeof HandlePaymentIntentSucceeded.static;

  export const HandlePaymentIntentPaymentFailed = t.Object({
    event: t.Unknown(),
  });
  export type HandlePaymentIntentPaymentFailed =
    typeof HandlePaymentIntentPaymentFailed.static;

  export const HandleCustomerSubscriptionUpdated = t.Object({
    event: t.Unknown(),
  });
  export type HandleCustomerSubscriptionUpdated =
    typeof HandleCustomerSubscriptionUpdated.static;

  export const HandleCustomerSubscriptionDeleted = t.Object({
    event: t.Unknown(),
  });
  export type HandleCustomerSubscriptionDeleted =
    typeof HandleCustomerSubscriptionDeleted.static;

  export const HandleChargeRefunded = t.Object({
    event: t.Unknown(),
  });
  export type HandleChargeRefunded = typeof HandleChargeRefunded.static;
}
