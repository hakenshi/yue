import { eq } from "drizzle-orm";
import { db } from "../../db/client";
import * as schema from "../../db/schema";
import { StripeService } from "../stripe/service";
import { CreditsService } from "../credits/service";
import { SubscriptionsService } from "../subscriptions/service";
import { TransactionsService } from "../transactions/service";
import { WebhooksModel } from "./model";

// Security: Track processed webhooks to prevent replay attacks
const processedWebhooks = new Set<string>();

function getEventId(event: unknown): string | null {
  if (typeof event === "object" && event !== null) {
    const e = event as Record<string, unknown>;
    if (typeof e.id === "string") {
      return e.id;
    }
  }
  return null;
}

export abstract class WebhooksService {
  static async handleStripeEvent(params: WebhooksModel.HandleStripeEvent) {
    // Security: Verify webhook signature (in production)
    // const event = stripe.webhooks.constructEvent(payload, signature, webhookSecret);

    // Security: Prevent replay attacks
    const eventId = getEventId(params.payload);
    if (eventId) {
      if (processedWebhooks.has(eventId)) {
        return { handled: true, replay: true };
      }
      processedWebhooks.add(eventId);

      // Clean up old entries (keep last 10000)
      if (processedWebhooks.size > 10000) {
        const iterator = processedWebhooks.values();
        const first = iterator.next().value;
        if (first) {
          processedWebhooks.delete(first);
        }
      }
    }

    return { handled: true };
  }

  static async handleInvoicePaid(params: WebhooksModel.HandleInvoicePaid) {
    // TODO: invoice.paid
    // - Atualizar subscription
    // - Criar transação de pagamento
    // - Se for assinatura nova, ativar plano
    return { handled: true };
  }

  static async handleInvoicePaymentFailed(
    params: WebhooksModel.HandleInvoicePaymentFailed,
  ) {
    // TODO: invoice.payment_failed
    // - Marcar subscription como past_due
    // - Notificar usuário
    return { handled: true };
  }

  static async handlePaymentIntentSucceeded(
    params: WebhooksModel.HandlePaymentIntentSucceeded,
  ) {
    // TODO: payment_intent.succeeded
    // - Se for PAYG topup: adicionar saldo
    // - Criar transação
    // - Marcar payg_topup como completed
    return { handled: true };
  }

  static async handlePaymentIntentPaymentFailed(
    params: WebhooksModel.HandlePaymentIntentPaymentFailed,
  ) {
    // TODO: payment_intent.payment_failed
    // - Marcar transação como failed
    // - Marcar payg_topup como failed
    // - Notificar usuário
    return { handled: true };
  }

  static async handleCustomerSubscriptionUpdated(
    params: WebhooksModel.HandleCustomerSubscriptionUpdated,
  ) {
    // TODO: customer.subscription.updated
    // - Atualizar status da subscription
    // - Se mudou de plano: atualizar plan_key
    return { handled: true };
  }

  static async handleCustomerSubscriptionDeleted(
    params: WebhooksModel.HandleCustomerSubscriptionDeleted,
  ) {
    // TODO: customer.subscription.deleted
    // - Marcar subscription como canceled
    // - Resetar para plano free
    return { handled: true };
  }

  static async handleChargeRefunded(
    params: WebhooksModel.HandleChargeRefunded,
  ) {
    // TODO: charge.refunded
    // - Criar transação de reembolso
    // - Ajustar saldo se necessário
    return { handled: true };
  }
}
