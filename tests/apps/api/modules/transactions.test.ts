import { describe, expect, it, beforeEach } from "bun:test";
import { treaty } from "@elysiajs/eden";
import { api } from "@api/app";

const client = treaty(api);

describe("Transactions Service - TDD", () => {
  beforeEach(async () => {
    // Setup: Create a user with credits for testing
    await client.credits.post({ userId: "test-user" });
  });

  describe("createTransaction", () => {
    it("should create a PAYG topup transaction", async () => {
      const { data, error } = await client.transactions.post({
        userId: "test-user",
        type: "payg_topup",
        amountCents: 1000,
        description: "Test topup",
      });

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(data).toHaveProperty("transactionId");
      expect(data).toHaveProperty("status", "pending");
      expect(typeof data?.transactionId).toBe("string");
    });

    it("should create a subscription payment transaction", async () => {
      const { data, error } = await client.transactions.post({
        userId: "test-user",
        type: "subscription_payment",
        amountCents: 2000,
        description: "Monthly subscription",
        stripeInvoiceId: "inv_test123",
      });

      expect(error).toBeNull();
      expect(data).toHaveProperty("transactionId");
      expect(data).toHaveProperty("type", "subscription_payment");
    });

    it("should create a PAYG charge transaction", async () => {
      const { data, error } = await client.transactions.post({
        userId: "test-user",
        type: "payg_charge",
        amountCents: -500,
        description: "API usage charge",
      });

      expect(error).toBeNull();
      expect(data).toHaveProperty("transactionId");
      expect(data?.amountCents).toBe(-500);
    });
  });

  describe("listTransactions", () => {
    it("should list transactions with pagination", async () => {
      // Create some transactions first
      await client.transactions.post({
        userId: "test-user",
        type: "payg_topup",
        amountCents: 1000,
      });
      await client.transactions.post({
        userId: "test-user",
        type: "payg_charge",
        amountCents: -100,
      });

      const { data, error } = await client.transactions
        .user({ userId: "test-user" })
        .get({
          query: { limit: "10", offset: "0" },
        });

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(data).toHaveProperty("transactions");
      expect(data).toHaveProperty("total");
      expect(Array.isArray(data?.transactions)).toBe(true);
      expect(data?.transactions.length).toBeGreaterThanOrEqual(2);
    });

    it("should respect pagination limits", async () => {
      const { data, error } = await client.transactions
        .user({ userId: "test-user" })
        .get({
          query: { limit: "1", offset: "0" },
        });

      expect(error).toBeNull();
      expect(data?.transactions.length).toBeLessThanOrEqual(1);
    });
  });

  describe("getTransaction", () => {
    it("should get a specific transaction by ID", async () => {
      const { data: created } = await client.transactions.post({
        userId: "test-user",
        type: "payg_topup",
        amountCents: 1000,
      });

      const { data, error } = await client.transactions
        .detail({
          transactionId: created?.transactionId || "",
        })
        .get();

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(data?.transaction).toHaveProperty("id", created?.transactionId);
      expect(data?.transaction).toHaveProperty("type", "payg_topup");
    });

    it("should return null for non-existent transaction", async () => {
      const { data, error } = await client.transactions
        .detail({
          transactionId: "non-existent-id",
        })
        .get();

      expect(error).toBeNull();
      expect(data?.transaction).toBeNull();
    });
  });

  describe("markAsCompleted", () => {
    it("should mark a transaction as completed", async () => {
      const { data: created } = await client.transactions.post({
        userId: "test-user",
        type: "payg_topup",
        amountCents: 1000,
      });

      const { data, error } = await client
        .transactions({
          transactionId: created?.transactionId || "",
        })
        .complete.post();

      expect(error).toBeNull();
      expect(data?.updated).toBe(true);
      expect(data?.status).toBe("completed");
    });
  });

  describe("markAsFailed", () => {
    it("should mark a transaction as failed with error message", async () => {
      const { data: created } = await client.transactions.post({
        userId: "test-user",
        type: "payg_topup",
        amountCents: 1000,
      });

      const { data, error } = await client
        .transactions({
          transactionId: created?.transactionId || "",
        })
        .fail.post({
          errorMessage: "Payment declined by bank",
        });

      expect(error).toBeNull();
      expect(data?.updated).toBe(true);
      expect(data?.status).toBe("failed");
    });
  });

  describe("processRefund", () => {
    it("should process a full refund", async () => {
      const { data: created } = await client.transactions.post({
        userId: "test-user",
        type: "payg_topup",
        amountCents: 1000,
      });
      await client
        .transactions({
          transactionId: created?.transactionId || "",
        })
        .complete.post();

      const { data, error } = await client
        .transactions({
          transactionId: created?.transactionId || "",
        })
        .refund.post();

      expect(error).toBeNull();
      expect(data?.refunded).toBe(true);
      expect(data?.refundAmount).toBe(1000);
    });

    it("should process a partial refund", async () => {
      const { data: created } = await client.transactions.post({
        userId: "test-user",
        type: "payg_topup",
        amountCents: 1000,
      });
      await client
        .transactions({
          transactionId: created?.transactionId || "",
        })
        .complete.post();

      const { data, error } = await client
        .transactions({
          transactionId: created?.transactionId || "",
        })
        .refund.post({
          amountCents: 500,
        });

      expect(error).toBeNull();
      expect(data?.refunded).toBe(true);
      expect(data?.refundAmount).toBe(500);
    });
  });

  describe("getBalance", () => {
    it("should calculate correct balance from transactions", async () => {
      // Use unique user to avoid conflicts
      const uniqueUser = `balance-test-${Date.now()}`;
      await client.credits.post({ userId: uniqueUser });

      // Create transactions: +1000, -300, +500
      const txn1 = await client.transactions.post({
        userId: uniqueUser,
        type: "payg_topup",
        amountCents: 1000,
      });
      const txn2 = await client.transactions.post({
        userId: uniqueUser,
        type: "payg_charge",
        amountCents: -300,
      });
      const txn3 = await client.transactions.post({
        userId: uniqueUser,
        type: "payg_topup",
        amountCents: 500,
      });

      // Mark all as completed to count in balance
      await client
        .transactions({ transactionId: txn1.data?.transactionId || "" })
        .complete.post();
      await client
        .transactions({ transactionId: txn2.data?.transactionId || "" })
        .complete.post();
      await client
        .transactions({ transactionId: txn3.data?.transactionId || "" })
        .complete.post();

      const { data, error } = await client.transactions
        .balance({
          userId: uniqueUser,
        })
        .get();

      expect(error).toBeNull();
      expect(data?.balanceCents).toBe(1200); // 1000 - 300 + 500
    });
  });

  describe("getMonthlySpending", () => {
    it("should calculate monthly spending", async () => {
      const { data, error } = await client.transactions
        .spending({
          userId: "test-user",
        })({
          year: "2024",
        })({
          month: "01",
        })
        .get();

      expect(error).toBeNull();
      expect(data).toHaveProperty("spendingCents");
      expect(typeof data?.spendingCents).toBe("number");
    });
  });
});
