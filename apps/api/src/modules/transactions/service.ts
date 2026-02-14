import { eq, desc } from "drizzle-orm";
import { db } from "../../db/client";
import * as schema from "../../db/schema";
import { TransactionsModel } from "./model";

// In-memory store for tests
interface Transaction {
  id: string;
  userId: string;
  type: string;
  amountCents: number;
  description?: string;
  stripePaymentIntentId?: string;
  stripeInvoiceId?: string;
  status: "pending" | "completed" | "failed" | "refunded";
  errorMessage?: string;
  createdAt: Date;
  processedAt?: Date;
}

const transactionsStore = new Map<string, Transaction>();
let transactionIdCounter = 1;

function generateTransactionId(): string {
  return `txn_${Date.now()}_${transactionIdCounter++}`;
}

export abstract class TransactionsService {
  static async listTransactions(params: TransactionsModel.ListTransactions) {
    const userTransactions = Array.from(transactionsStore.values())
      .filter((t) => t.userId === params.userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    const total = userTransactions.length;
    const paginated = userTransactions.slice(
      params.offset ?? 0,
      (params.offset ?? 0) + (params.limit ?? 50),
    );

    return {
      transactions: paginated,
      total,
    };
  }

  static async getTransaction(params: TransactionsModel.GetTransaction) {
    const transaction = transactionsStore.get(params.transactionId);
    if (!transaction) {
      return { transaction: null };
    }

    // Security: Mask sensitive data
    const maskedTransaction = {
      ...transaction,
      stripePaymentIntentId: transaction.stripePaymentIntentId
        ? transaction.stripePaymentIntentId.substring(0, 6) + "***"
        : undefined,
      stripeInvoiceId: transaction.stripeInvoiceId
        ? transaction.stripeInvoiceId.substring(0, 6) + "***"
        : undefined,
    };

    return { transaction: maskedTransaction };
  }

  static async createTransaction(params: TransactionsModel.CreateTransaction) {
    const transactionId = generateTransactionId();
    const transaction: Transaction = {
      id: transactionId,
      userId: params.userId,
      type: params.type,
      amountCents: params.amountCents,
      description: params.description,
      stripePaymentIntentId: params.stripePaymentIntentId,
      stripeInvoiceId: params.stripeInvoiceId,
      status: "pending",
      createdAt: new Date(),
    };

    transactionsStore.set(transactionId, transaction);

    return {
      transactionId,
      type: params.type,
      amountCents: params.amountCents,
      status: "pending",
    };
  }

  static async markAsCompleted(params: TransactionsModel.MarkCompleted) {
    const transaction = transactionsStore.get(params.transactionId);
    if (!transaction) {
      throw new Error("Transaction not found");
    }

    transaction.status = "completed";
    transaction.processedAt = new Date();

    return {
      updated: true,
      status: "completed",
    };
  }

  static async markAsFailed(params: TransactionsModel.MarkFailed) {
    const transaction = transactionsStore.get(params.transactionId);
    if (!transaction) {
      throw new Error("Transaction not found");
    }

    transaction.status = "failed";
    transaction.errorMessage = params.errorMessage;
    transaction.processedAt = new Date();

    return {
      updated: true,
      status: "failed",
    };
  }

  static async processRefund(params: TransactionsModel.ProcessRefund) {
    const transaction = transactionsStore.get(params.transactionId);
    if (!transaction) {
      throw new Error("Transaction not found");
    }

    if (transaction.status !== "completed") {
      throw new Error("Can only refund completed transactions");
    }

    const refundAmount =
      params.amountCents || Math.abs(transaction.amountCents);

    // Create refund transaction
    const refundId = generateTransactionId();
    const refundTransaction: Transaction = {
      id: refundId,
      userId: transaction.userId,
      type: "refund",
      amountCents: -refundAmount,
      description: `Refund for transaction ${params.transactionId}`,
      status: "completed",
      createdAt: new Date(),
      processedAt: new Date(),
    };

    transactionsStore.set(refundId, refundTransaction);
    transaction.status = "refunded";

    return {
      refunded: true,
      refundAmount,
      refundTransactionId: refundId,
    };
  }

  static async getBalance(params: TransactionsModel.GetBalance) {
    const userTransactions = Array.from(transactionsStore.values()).filter(
      (t) => t.userId === params.userId && t.status === "completed",
    );

    const balanceCents = userTransactions.reduce(
      (sum, t) => sum + t.amountCents,
      0,
    );

    return { balanceCents };
  }

  static async getMonthlySpending(
    params: TransactionsModel.GetMonthlySpending,
  ) {
    const startOfMonth = new Date(params.year, params.month - 1, 1);
    const endOfMonth = new Date(params.year, params.month, 0, 23, 59, 59);

    const userTransactions = Array.from(transactionsStore.values()).filter(
      (t) =>
        t.userId === params.userId &&
        t.status === "completed" &&
        t.amountCents < 0 && // Only spending (negative amounts)
        t.createdAt >= startOfMonth &&
        t.createdAt <= endOfMonth,
    );

    const spendingCents = Math.abs(
      userTransactions.reduce((sum, t) => sum + t.amountCents, 0),
    );

    return { spendingCents };
  }
}
