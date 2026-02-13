import type { PaygPort } from "./types";

export class PaygService {
  constructor(private payg: PaygPort) {}

  getBalance(userId: string) {
    return this.payg.getBalance(userId);
  }
}

export function createDefaultPaygPort(): PaygPort {
  return {
    async getBalance(_userId) {
      const thresholdUsdCents = 1000n;
      const suggestedTopupUsdCents = 2500n;
      const balanceMicroCents = 0n;

      return {
        balanceMicroCents: balanceMicroCents.toString(),
        lowBalance: balanceMicroCents <= thresholdUsdCents * 1_000_000n,
        thresholdUsdCents: thresholdUsdCents.toString(),
        suggestedTopupUsdCents: suggestedTopupUsdCents.toString(),
      };
    },
  };
}
