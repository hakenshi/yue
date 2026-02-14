import Stripe from "stripe";
import { db } from "../../db/client";
import { StripeModel } from "./model";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export abstract class StripeService {
  static getClient(): Stripe {
    return stripe;
  }

  static async createCustomer(params: StripeModel.CreateCustomer) {
    // TODO: Implementar criação de customer no Stripe
    return { customerId: "" };
  }

  static async createPaymentIntent(params: StripeModel.CreatePaymentIntent) {
    // TODO: Implementar criação de PaymentIntent
    return { clientSecret: "" };
  }

  static async createSubscription(params: StripeModel.CreateSubscription) {
    // TODO: Implementar criação de assinatura
    return { subscriptionId: "" };
  }

  static async cancelSubscription(params: StripeModel.CancelSubscription) {
    // TODO: Implementar cancelamento
    return { canceled: true };
  }

  static async attachPaymentMethod(params: StripeModel.AttachPaymentMethod) {
    // TODO: Anexar método de pagamento ao customer
    return { attached: true };
  }

  static async setDefaultPaymentMethod(
    params: StripeModel.SetDefaultPaymentMethod,
  ) {
    // TODO: Definir método de pagamento padrão
    return { updated: true };
  }
}
