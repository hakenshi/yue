import { eq } from "drizzle-orm";
import { db } from "../../db/client";
import * as schema from "../../db/schema";
import { StripeService } from "../stripe/service";
import { CreditsService } from "../credits/service";
import { PLANS } from "../../config/plans";
import { SubscriptionsModel } from "./model";

export abstract class SubscriptionsService {
  static async getSubscription(params: SubscriptionsModel.GetSubscription) {
    // TODO: Buscar assinatura do usuário
    return { planKey: "free", status: "active" };
  }

  static async createSubscription(
    params: SubscriptionsModel.CreateSubscription,
  ) {
    // TODO: Criar nova assinatura
    return { created: true };
  }

  static async upgradeSubscription(
    params: SubscriptionsModel.UpgradeSubscription,
  ) {
    // TODO: Upgrade de plano (prorata se necessário)
    return { upgraded: true };
  }

  static async downgradeSubscription(
    params: SubscriptionsModel.DowngradeSubscription,
  ) {
    // TODO: Downgrade de plano (aplica no próximo ciclo)
    return { downgraded: true };
  }

  static async cancelSubscription(
    params: SubscriptionsModel.CancelSubscription,
  ) {
    // TODO: Cancelar assinatura (mantém até o fim do período)
    return { canceled: true };
  }

  static async renewSubscription(params: SubscriptionsModel.RenewSubscription) {
    // TODO: Renovar assinatura (chamado pelo webhook)
    // Resetar planAllowance
    return { renewed: true };
  }

  static async handlePaymentFailure(
    params: SubscriptionsModel.HandlePaymentFailure,
  ) {
    // TODO: Lidar com falha de pagamento
    // Suspende ou notifica usuário
    return { handled: true };
  }

  static async getPlanDetails(params: SubscriptionsModel.GetPlanDetails) {
    return PLANS[params.planKey as keyof typeof PLANS];
  }

  static async listAvailablePlans() {
    return Object.entries(PLANS).map(([key, plan]) => ({
      key,
      ...plan,
      priceFormatted: `$${(plan.priceCents / 100).toFixed(2)}`,
    }));
  }
}
