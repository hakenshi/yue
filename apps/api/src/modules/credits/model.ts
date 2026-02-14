import { t } from "elysia";

export namespace CreditsModel {
  export const GetCredits = t.Object({
    userId: t.String(),
  });
  export type GetCredits = typeof GetCredits.static;

  export const CreateCredits = t.Object({
    userId: t.String(),
    initialPlanCredits: t.Optional(t.Number({ default: 0 })),
    initialPaygBalance: t.Optional(t.Number({ default: 0 })),
    autoTopupEnabled: t.Optional(t.Boolean({ default: false })),
    autoTopupThreshold: t.Optional(t.Number({ default: 500 })),
    autoTopupAmount: t.Optional(t.Number({ default: 1000 })),
  });
  export type CreateCredits = typeof CreateCredits.static;

  export const AddPaygBalance = t.Object({
    userId: t.String(),
    amountCents: t.Number(),
  });
  export type AddPaygBalance = typeof AddPaygBalance.static;

  export const DeductPaygBalance = t.Object({
    userId: t.String(),
    amountCents: t.Number(),
  });
  export type DeductPaygBalance = typeof DeductPaygBalance.static;

  export const CheckThreshold = t.Object({
    userId: t.String(),
  });
  export type CheckThreshold = typeof CheckThreshold.static;

  export const ResetPlanAllowance = t.Object({
    userId: t.String(),
    monthlyCredits: t.Number(),
  });
  export type ResetPlanAllowance = typeof ResetPlanAllowance.static;

  export const DeductPlanAllowance = t.Object({
    userId: t.String(),
    tokens: t.Number(),
  });
  export type DeductPlanAllowance = typeof DeductPlanAllowance.static;

  export const HasEnoughCredits = t.Object({
    userId: t.String(),
    estimatedCostCents: t.Number(),
  });
  export type HasEnoughCredits = typeof HasEnoughCredits.static;

  export const UpdateAutoTopupConfig = t.Object({
    userId: t.String(),
    enabled: t.Boolean(),
    thresholdCents: t.Optional(t.Number()),
    amountCents: t.Optional(t.Number()),
  });
  export type UpdateAutoTopupConfig = typeof UpdateAutoTopupConfig.static;
}
