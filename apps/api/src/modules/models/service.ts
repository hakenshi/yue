import { eq } from "drizzle-orm";
import { db } from "../../db/client";
import { ModelsModel } from "./model";

interface ModelConfig {
  id: string;
  name: string;
  provider: string;
  costPer1kInputTokens: number;
  costPer1kOutputTokens: number;
  contextWindow: number;
  maxTokens: number;
  enabled: boolean;
}

const MODELS = await fetch("https://models.dev/api.json").then((res) => res.json());

console.log(MODELS)

// export abstract class ModelsService {
//   static async listModels() {
//     return MODELS.filter((m) => m.enabled);
//   }

//   static async getModel(params: ModelsModel.GetModel) {
//     return MODELS.find((m) => m.id === params.modelId && m.enabled);
//   }

//   static async calculateCost(params: ModelsModel.CalculateCost) {
//     const model = MODELS.find((m) => m.id === params.modelId && m.enabled);
//     if (!model) {
//       throw new Error(`Model ${params.modelId} not found or disabled`);
//     }

//     const inputCost = (params.promptTokens / 1000) * model.costPer1kInputTokens;
//     const outputCost =
//       (params.completionTokens / 1000) * model.costPer1kOutputTokens;

//     return Math.ceil(inputCost + outputCost);
//   }

//   static async validateModelAccess(params: ModelsModel.ValidateModelAccess) {
//     // TODO: Verificar se o modelo está disponível para o plano do usuário
//     // Ex: Enterprise pode ter acesso a modelos que Free não tem
//     return { hasAccess: true };
//   }
// }
