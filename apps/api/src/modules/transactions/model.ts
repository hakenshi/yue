import { t } from "elysia";

export namespace TransactionsModel {
  export const ListTransactions = t.Object({
    userId: t.String(),
    limit: t.Optional(t.Number({ default: 50 })),
    offset: t.Optional(t.Number({ default: 0 })),
  });
  export type ListTransactions = typeof ListTransactions.static;

  export const GetTransaction = t.Object({
    transactionId: t.String(),
  });
  export type GetTransaction = typeof GetTransaction.static;

  export const CreateTransaction = t.Object({
    userId: t.String(),
    type: t.Union([
      t.Literal("subscription_payment"),
      t.Literal("payg_topup"),
      t.Literal("payg_charge"),
      t.Literal("plan_credit_grant"),
      t.Literal("refund"),
      t.Literal("adjustment"),
    ]),
    amountCents: t.Number(),
    description: t.Optional(t.String()),
    stripePaymentIntentId: t.Optional(t.String()),
    stripeInvoiceId: t.Optional(t.String()),
    metadata: t.Optional(t.Record(t.String(), t.Unknown())),
  });
  export type CreateTransaction = typeof CreateTransaction.static;

  export const MarkCompleted = t.Object({
    transactionId: t.String(),
  });
  export type MarkCompleted = typeof MarkCompleted.static;

  export const MarkFailed = t.Object({
    transactionId: t.String(),
    errorMessage: t.Optional(t.String()),
  });
  export type MarkFailed = typeof MarkFailed.static;

  export const ProcessRefund = t.Object({
    transactionId: t.String(),
    amountCents: t.Optional(t.Number()),
  });
  export type ProcessRefund = typeof ProcessRefund.static;

  export const GetBalance = t.Object({
    userId: t.String(),
  });
  export type GetBalance = typeof GetBalance.static;

  export const GetMonthlySpending = t.Object({
    userId: t.String(),
    year: t.Number(),
    month: t.Number(),
  });
  export type GetMonthlySpending = typeof GetMonthlySpending.static;
}
