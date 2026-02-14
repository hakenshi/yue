import { Elysia, t } from "elysia";
import { CreditsService } from "./service";
import { CreditsModel } from "./model";

export { CreditsService } from "./service";
export { CreditsModel } from "./model";

export const credits = new Elysia({ prefix: "/credits" })
  .get(
    "/:userId",
    ({ params }) => CreditsService.getCredits({ userId: params.userId }),
    {
      params: t.Object({ userId: t.String() }),
    },
  )
  .post("/", ({ body }) => CreditsService.createCredits(body), {
    body: CreditsModel.CreateCredits,
  })
  .post("/payg/add", ({ body }) => CreditsService.addPaygBalance(body), {
    body: CreditsModel.AddPaygBalance,
  })
  .post("/payg/deduct", ({ body }) => CreditsService.deductPaygBalance(body), {
    body: CreditsModel.DeductPaygBalance,
  })
  .post(
    "/check-threshold",
    ({ body }) => CreditsService.checkThresholdAndTopup(body),
    {
      body: CreditsModel.CheckThreshold,
    },
  )
  .post("/plan/reset", ({ body }) => CreditsService.resetPlanAllowance(body), {
    body: CreditsModel.ResetPlanAllowance,
  })
  .post(
    "/plan/deduct",
    ({ body }) => CreditsService.deductPlanAllowance(body),
    {
      body: CreditsModel.DeductPlanAllowance,
    },
  )
  .post("/check", ({ body }) => CreditsService.hasEnoughCredits(body), {
    body: CreditsModel.HasEnoughCredits,
  })
  .post(
    "/auto-topup/config",
    ({ body }) => CreditsService.updateAutoTopupConfig(body),
    {
      body: CreditsModel.UpdateAutoTopupConfig,
    },
  );
