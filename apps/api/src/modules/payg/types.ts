export type PaygPort = {
  getBalance(userId: string): Promise<{
    balanceMicroCents: string;
    lowBalance: boolean;
    thresholdUsdCents: string;
    suggestedTopupUsdCents: string;
  }>;
};
