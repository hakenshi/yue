import { t } from "elysia";

export namespace ModelsModel {
  export const ModelConfig = t.Object({
    id: t.String(),
    name: t.String(),
    provider: t.String(),
    costPer1kInputTokens: t.Number(),
    costPer1kOutputTokens: t.Number(),
    contextWindow: t.Number(),
    maxTokens: t.Number(),
    enabled: t.Boolean(),
  });
  export type ModelConfig = typeof ModelConfig.static;

  export const GetModel = t.Object({
    modelId: t.String(),
  });
  export type GetModel = typeof GetModel.static;

  export const CalculateCost = t.Object({
    modelId: t.String(),
    promptTokens: t.Number(),
    completionTokens: t.Number(),
  });
  export type CalculateCost = typeof CalculateCost.static;

  export const ValidateModelAccess = t.Object({
    modelId: t.String(),
    userPlanKey: t.String(),
  });
  export type ValidateModelAccess = typeof ValidateModelAccess.static;
}
