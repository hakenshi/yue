import { eq, and, gte, lte, sql } from "drizzle-orm";
import { db } from "../../db/client";
import { credits } from "../../db/schema/credits";
import { CreditsModel } from "./model";

export abstract class CreditsService {
  static async getCredits(params: CreditsModel.GetCredits) {
    const result = await db
      .select()
      .from(credits)
      .where(eq(credits.userId, params.userId));

    if (result.length === 0) {
      const [newCredits] = await db
        .insert(credits)
        .values({
          userId: params.userId,
          paygBalanceCents: 0,
          planAllowanceRemaining: 0,
          autoTopupEnabled: false,
          autoTopupThresholdCents: 500,
          autoTopupAmountCents: 1000,
        })
        .returning();
      return {
        userId: newCredits.userId,
        paygBalanceCents: newCredits.paygBalanceCents,
        planAllowanceRemaining: newCredits.planAllowanceRemaining,
        planAllowanceResetsAt: newCredits.planAllowanceResetsAt,
        autoTopupEnabled: newCredits.autoTopupEnabled,
        autoTopupThreshold: newCredits.autoTopupThresholdCents,
        autoTopupAmount: newCredits.autoTopupAmountCents,
      };
    }

    const c = result[0];
    return {
      userId: c.userId,
      paygBalanceCents: c.paygBalanceCents,
      planAllowanceRemaining: c.planAllowanceRemaining,
      planAllowanceResetsAt: c.planAllowanceResetsAt,
      autoTopupEnabled: c.autoTopupEnabled,
      autoTopupThreshold: c.autoTopupThresholdCents,
      autoTopupAmount: c.autoTopupAmountCents,
    };
  }

  static async createCredits(params: CreditsModel.CreateCredits) {
    const [c] = await db
      .insert(credits)
      .values({
        userId: params.userId,
        paygBalanceCents: params.initialPaygBalance ?? 0,
        planAllowanceRemaining: params.initialPlanCredits ?? 0,
        autoTopupEnabled: params.autoTopupEnabled ?? false,
        autoTopupThresholdCents: params.autoTopupThreshold ?? 500,
        autoTopupAmountCents: params.autoTopupAmount ?? 1000,
      })
      .onConflictDoUpdate({
        target: credits.userId,
        set: {
          paygBalanceCents: params.initialPaygBalance ?? 0,
          planAllowanceRemaining: params.initialPlanCredits ?? 0,
          autoTopupEnabled: params.autoTopupEnabled ?? false,
          autoTopupThresholdCents: params.autoTopupThreshold ?? 500,
          autoTopupAmountCents: params.autoTopupAmount ?? 1000,
          updatedAt: new Date(),
        },
      })
      .returning();

    return { created: true, id: c.id };
  }

  static async addPaygBalance(params: CreditsModel.AddPaygBalance) {
    if (params.amountCents <= 0) {
      throw new Error("Amount must be positive");
    }
    if (params.amountCents > 1_000_000_000) {
      throw new Error("Amount exceeds maximum allowed");
    }

    const [updated] = await db
      .update(credits)
      .set({
        paygBalanceCents: sql`${credits.paygBalanceCents} + ${params.amountCents}`,
        updatedAt: new Date(),
      })
      .where(eq(credits.userId, params.userId))
      .returning();

    if (!updated) {
      throw new Error("User credits not found");
    }

    return {
      added: true,
      newBalance: updated.paygBalanceCents,
    };
  }

  static async deductPaygBalance(params: CreditsModel.DeductPaygBalance) {
    const [updated] = await db
      .update(credits)
      .set({
        paygBalanceCents: sql`${credits.paygBalanceCents} - ${params.amountCents}`,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(credits.userId, params.userId),
          gte(credits.paygBalanceCents, params.amountCents),
        ),
      )
      .returning();

    if (!updated) {
      throw new Error("Insufficient PAYG balance or user not found");
    }

    return {
      deducted: true,
      remaining: updated.paygBalanceCents,
    };
  }

  static async checkThresholdAndTopup(params: CreditsModel.CheckThreshold) {
    const result = await db
      .select()
      .from(credits)
      .where(eq(credits.userId, params.userId));

    if (result.length === 0 || !result[0].autoTopupEnabled) {
      return { toppedUp: false };
    }

    const c = result[0];
    if (c.paygBalanceCents <= (c.autoTopupThresholdCents ?? 0)) {
      const [updated] = await db
        .update(credits)
        .set({
          paygBalanceCents: sql`${credits.paygBalanceCents} + ${c.autoTopupAmountCents ?? 0}`,
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(credits.userId, params.userId),
            lte(credits.paygBalanceCents, c.autoTopupThresholdCents ?? 0),
          ),
        )
        .returning();

      if (updated) {
        return {
          toppedUp: true,
          amount: c.autoTopupAmountCents ?? 0,
          newBalance: updated.paygBalanceCents,
        };
      }
    }

    return { toppedUp: false };
  }

  static async resetPlanAllowance(params: CreditsModel.ResetPlanAllowance) {
    const [updated] = await db
      .update(credits)
      .set({
        planAllowanceRemaining: params.monthlyCredits,
        planAllowanceResetsAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(),
      })
      .where(eq(credits.userId, params.userId))
      .returning();

    if (!updated) {
      throw new Error("User credits not found");
    }

    return { reset: true };
  }

  static async deductPlanAllowance(params: CreditsModel.DeductPlanAllowance) {
    const [updated] = await db
      .update(credits)
      .set({
        planAllowanceRemaining: sql`${credits.planAllowanceRemaining} - ${params.tokens}`,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(credits.userId, params.userId),
          gte(credits.planAllowanceRemaining, params.tokens),
        ),
      )
      .returning();

    if (!updated) {
      throw new Error("Insufficient plan allowance or user not found");
    }

    return {
      deducted: true,
      remaining: updated.planAllowanceRemaining,
    };
  }

  static async hasEnoughCredits(params: CreditsModel.HasEnoughCredits) {
    const result = await db
      .select()
      .from(credits)
      .where(eq(credits.userId, params.userId));

    if (result.length === 0) {
      return { hasEnough: false };
    }

    const c = result[0];
    const totalAvailable =
      (c.paygBalanceCents ?? 0) + (c.planAllowanceRemaining ?? 0);
    const hasEnough = totalAvailable >= params.estimatedCostCents;

    return { hasEnough };
  }

  static async updateAutoTopupConfig(
    params: CreditsModel.UpdateAutoTopupConfig,
  ) {
    const updateData: Record<string, unknown> = {
      autoTopupEnabled: params.enabled,
      updatedAt: new Date(),
    };

    if (params.thresholdCents !== undefined) {
      updateData.autoTopupThresholdCents = params.thresholdCents;
    }
    if (params.amountCents !== undefined) {
      updateData.autoTopupAmountCents = params.amountCents;
    }

    const [updated] = await db
      .update(credits)
      .set(updateData)
      .where(eq(credits.userId, params.userId))
      .returning();

    if (!updated) {
      throw new Error("User credits not found");
    }

    return { updated: true };
  }
}
