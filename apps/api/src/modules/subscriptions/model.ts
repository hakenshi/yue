import { t } from "elysia";

export namespace SubscriptionsModel {
  export const GetSubscription = t.Object({
    userId: t.String(),
  });
  export type GetSubscription = typeof GetSubscription.static;

  export const CreateSubscription = t.Object({
    userId: t.String(),
    planKey: t.String(),
  });
  export type CreateSubscription = typeof CreateSubscription.static;

  export const UpgradeSubscription = t.Object({
    userId: t.String(),
    newPlanKey: t.String(),
  });
  export type UpgradeSubscription = typeof UpgradeSubscription.static;

  export const DowngradeSubscription = t.Object({
    userId: t.String(),
    newPlanKey: t.String(),
  });
  export type DowngradeSubscription = typeof DowngradeSubscription.static;

  export const CancelSubscription = t.Object({
    userId: t.String(),
  });
  export type CancelSubscription = typeof CancelSubscription.static;

  export const RenewSubscription = t.Object({
    userId: t.String(),
  });
  export type RenewSubscription = typeof RenewSubscription.static;

  export const HandlePaymentFailure = t.Object({
    userId: t.String(),
  });
  export type HandlePaymentFailure = typeof HandlePaymentFailure.static;

  export const GetPlanDetails = t.Object({
    planKey: t.String(),
  });
  export type GetPlanDetails = typeof GetPlanDetails.static;
}
