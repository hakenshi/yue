import { describe, expect, it } from "bun:test";
import { treaty } from "@elysiajs/eden";
import { api } from "@api/app";

const client = treaty(api);

describe("Credits Service - TDD", () => {
  describe("getCredits", () => {
    it("should return credits for an existing user", async () => {
      const { data, error } = await client
        .credits({ userId: "user-123" })
        .get();

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(data).toHaveProperty("paygBalanceCents");
      expect(data).toHaveProperty("planAllowanceRemaining");
      expect(data).toHaveProperty("planAllowanceResetsAt");
      expect(typeof data?.paygBalanceCents).toBe("number");
      expect(typeof data?.planAllowanceRemaining).toBe("number");
    });

    it("should create default credits for a new user", async () => {
      const { data, error } = await client
        .credits({ userId: "new-user-456" })
        .get();

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(data?.paygBalanceCents).toBe(0);
      expect(data?.planAllowanceRemaining).toBe(0);
    });
  });

  describe("hasEnoughCredits", () => {
    it("should return true when user has enough plan allowance", async () => {
      // Setup: Create user with plan allowance
      await client.credits.post({
        userId: "user-with-plan",
        initialPlanCredits: 1000,
      });

      const { data, error } = await client.credits.check.post({
        userId: "user-with-plan",
        estimatedCostCents: 500,
      });

      expect(error).toBeNull();
      expect(data?.hasEnough).toBe(true);
    });

    it("should return true when user has enough PAYG balance", async () => {
      // Setup: Create user with PAYG balance
      await client.credits.post({
        userId: "user-with-payg",
        initialPaygBalance: 1000,
      });

      const { data, error } = await client.credits.check.post({
        userId: "user-with-payg",
        estimatedCostCents: 500,
      });

      expect(error).toBeNull();
      expect(data?.hasEnough).toBe(true);
    });

    it("should return false when user has insufficient credits", async () => {
      // Setup: Create user with no credits
      await client.credits.post({ userId: "user-broke" });

      const { data, error } = await client.credits.check.post({
        userId: "user-broke",
        estimatedCostCents: 100,
      });

      expect(error).toBeNull();
      expect(data?.hasEnough).toBe(false);
    });
  });

  describe("deductPlanAllowance", () => {
    it("should deduct from plan allowance", async () => {
      // Setup
      await client.credits.post({
        userId: "deduct-test",
        initialPlanCredits: 1000,
      });

      const { data, error } = await client.credits.plan.deduct.post({
        userId: "deduct-test",
        tokens: 100,
      });

      expect(error).toBeNull();
      expect(data?.deducted).toBe(true);
      expect(data?.remaining).toBe(900);
    });

    it("should fail when plan allowance is insufficient", async () => {
      await client.credits.post({
        userId: "low-allowance",
        initialPlanCredits: 50,
      });

      const { data, error } = await client.credits.plan.deduct.post({
        userId: "low-allowance",
        tokens: 100,
      });

      expect(error).toBeDefined();
      expect(data).toBeNull();
    });
  });

  describe("deductPaygBalance", () => {
    it("should deduct from PAYG balance", async () => {
      await client.credits.post({
        userId: "payg-deduct",
        initialPaygBalance: 1000,
      });

      const { data, error } = await client.credits.payg.deduct.post({
        userId: "payg-deduct",
        amountCents: 100,
      });

      expect(error).toBeNull();
      expect(data?.deducted).toBe(true);
      expect(data?.remaining).toBe(900);
    });
  });

  describe("addPaygBalance", () => {
    it("should add to PAYG balance", async () => {
      await client.credits.post({ userId: "add-test" });

      const { data, error } = await client.credits.payg.add.post({
        userId: "add-test",
        amountCents: 500,
      });

      expect(error).toBeNull();
      expect(data?.added).toBe(true);
      expect(data?.newBalance).toBe(500);
    });
  });

  describe("checkThresholdAndTopup", () => {
    it("should trigger auto-topup when balance below threshold", async () => {
      // Setup: User with auto-topup enabled
      await client.credits.post({
        userId: "auto-topup-test",
        initialPaygBalance: 300,
        autoTopupEnabled: true,
        autoTopupThreshold: 500,
        autoTopupAmount: 1000,
      });

      const { data, error } = await client.credits["check-threshold"].post({
        userId: "auto-topup-test",
      });

      expect(error).toBeNull();
      expect(data?.toppedUp).toBe(true);
      expect(data?.amount).toBe(1000);
    });

    it("should not trigger auto-topup when balance above threshold", async () => {
      await client.credits.post({
        userId: "no-topup-test",
        initialPaygBalance: 1000,
        autoTopupEnabled: true,
        autoTopupThreshold: 500,
        autoTopupAmount: 1000,
      });

      const { data, error } = await client.credits["check-threshold"].post({
        userId: "no-topup-test",
      });

      expect(error).toBeNull();
      expect(data?.toppedUp).toBe(false);
    });
  });
});
