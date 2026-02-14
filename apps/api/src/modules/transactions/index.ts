import { Elysia, t } from "elysia";
import { TransactionsService } from "./service";
import { TransactionsModel } from "./model";

export { TransactionsService } from "./service";
export { TransactionsModel } from "./model";

export const transactions = new Elysia({ prefix: "/transactions" })
  // List transactions for a user
  .get(
    "/user/:userId",
    ({ params, query }) =>
      TransactionsService.listTransactions({
        userId: params.userId,
        limit: query.limit ? Number(query.limit) : undefined,
        offset: query.offset ? Number(query.offset) : undefined,
      }),
    {
      params: t.Object({ userId: t.String() }),
      query: t.Object({
        limit: t.Optional(t.String()),
        offset: t.Optional(t.String()),
      }),
    },
  )
  // Get specific transaction
  .get(
    "/detail/:transactionId",
    ({ params }) =>
      TransactionsService.getTransaction({
        transactionId: params.transactionId,
      }),
    {
      params: t.Object({ transactionId: t.String() }),
    },
  )
  // Create transaction
  .post("/", ({ body }) => TransactionsService.createTransaction(body), {
    body: TransactionsModel.CreateTransaction,
  })
  // Mark as completed
  .post(
    "/:transactionId/complete",
    ({ params }) =>
      TransactionsService.markAsCompleted({
        transactionId: params.transactionId,
      }),
    {
      params: t.Object({ transactionId: t.String() }),
    },
  )
  // Mark as failed
  .post(
    "/:transactionId/fail",
    ({ params, body }) =>
      TransactionsService.markAsFailed({
        transactionId: params.transactionId,
        errorMessage: body?.errorMessage,
      }),
    {
      params: t.Object({ transactionId: t.String() }),
      body: t.Optional(t.Object({ errorMessage: t.Optional(t.String()) })),
    },
  )
  // Process refund
  .post(
    "/:transactionId/refund",
    ({ params, body }) =>
      TransactionsService.processRefund({
        transactionId: params.transactionId,
        amountCents: body?.amountCents,
      }),
    {
      params: t.Object({ transactionId: t.String() }),
      body: t.Optional(t.Object({ amountCents: t.Optional(t.Number()) })),
    },
  )
  // Get balance
  .get(
    "/balance/:userId",
    ({ params }) => TransactionsService.getBalance({ userId: params.userId }),
    {
      params: t.Object({ userId: t.String() }),
    },
  )
  // Get monthly spending
  .get(
    "/spending/:userId/:year/:month",
    ({ params }) =>
      TransactionsService.getMonthlySpending({
        userId: params.userId,
        year: Number(params.year),
        month: Number(params.month),
      }),
    {
      params: t.Object({
        userId: t.String(),
        year: t.String(),
        month: t.String(),
      }),
    },
  );
