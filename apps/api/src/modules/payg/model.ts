import { t } from "elysia";
import { centsString, errorResponse } from "../../common";

export const PaygModel = {
  balanceResponse: t.Object({
    balanceMicroCents: t.String(),
    lowBalance: t.Boolean(),
    thresholdUsdCents: centsString,
    suggestedTopupUsdCents: centsString,
  }),

  errorResponse,
};
