import { Elysia, t } from "elysia";
import { SubscriptionsService } from "./service";
import { SubscriptionsModel } from "./model";

export { SubscriptionsService } from "./service";
export { SubscriptionsModel } from "./model";

export const subscriptions = new Elysia({ prefix: "/subscriptions" })
  .get(
    "/:userId",
    ({ params }) =>
      SubscriptionsService.getSubscription({ userId: params.userId }),
    {
      params: t.Object({ userId: t.String() }),
    },
  )
  .post("/", ({ body }) => SubscriptionsService.createSubscription(body), {
    body: SubscriptionsModel.CreateSubscription,
  })
  .post(
    "/upgrade",
    ({ body }) => SubscriptionsService.upgradeSubscription(body),
    {
      body: SubscriptionsModel.UpgradeSubscription,
    },
  )
  .post(
    "/downgrade",
    ({ body }) => SubscriptionsService.downgradeSubscription(body),
    {
      body: SubscriptionsModel.DowngradeSubscription,
    },
  )
  .post(
    "/cancel",
    ({ body }) => SubscriptionsService.cancelSubscription(body),
    {
      body: SubscriptionsModel.CancelSubscription,
    },
  )
  .post("/renew", ({ body }) => SubscriptionsService.renewSubscription(body), {
    body: SubscriptionsModel.RenewSubscription,
  })
  .post(
    "/payment-failure",
    ({ body }) => SubscriptionsService.handlePaymentFailure(body),
    {
      body: SubscriptionsModel.HandlePaymentFailure,
    },
  )
  .get("/plans", () => SubscriptionsService.listAvailablePlans())
  .get(
    "/plans/:planKey",
    ({ params }) =>
      SubscriptionsService.getPlanDetails({ planKey: params.planKey }),
    {
      params: t.Object({ planKey: t.String() }),
    },
  );
