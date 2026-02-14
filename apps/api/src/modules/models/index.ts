import { Elysia, t } from "elysia";
import { ModelsService } from "./service";
import { ModelsModel } from "./model";

export { ModelsService } from "./service";
export { ModelsModel } from "./model";

export const models = new Elysia({ prefix: "/models" })
  .get("/", () => ModelsService.listModels())
  .get(
    "/:modelId",
    ({ params }) => ModelsService.getModel({ modelId: params.modelId }),
    {
      params: t.Object({ modelId: t.String() }),
    },
  )
  .post("/calculate-cost", ({ body }) => ModelsService.calculateCost(body), {
    body: ModelsModel.CalculateCost,
  })
  .post(
    "/validate-access",
    ({ body }) => ModelsService.validateModelAccess(body),
    {
      body: ModelsModel.ValidateModelAccess,
    },
  );
