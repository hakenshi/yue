import { t } from "elysia";

export namespace StripeModel {
  export const CreateCustomer = t.Object({
    userId: t.String(),
    email: t.String(),
    name: t.Optional(t.String()),
  });
  export type CreateCustomer = typeof CreateCustomer.static;

  export const CreatePaymentIntent = t.Object({
    customerId: t.String(),
    amountCents: t.Number(),
    metadata: t.Optional(t.Record(t.String(), t.String())),
  });
  export type CreatePaymentIntent = typeof CreatePaymentIntent.static;

  export const CreateSubscription = t.Object({
    customerId: t.String(),
    priceId: t.String(),
  });
  export type CreateSubscription = typeof CreateSubscription.static;

  export const CancelSubscription = t.Object({
    subscriptionId: t.String(),
  });
  export type CancelSubscription = typeof CancelSubscription.static;

  export const AttachPaymentMethod = t.Object({
    customerId: t.String(),
    paymentMethodId: t.String(),
  });
  export type AttachPaymentMethod = typeof AttachPaymentMethod.static;

  export const SetDefaultPaymentMethod = t.Object({
    customerId: t.String(),
    paymentMethodId: t.String(),
  });
  export type SetDefaultPaymentMethod = typeof SetDefaultPaymentMethod.static;
}
