export const PLANS = {
  free: { name: "Free", monthlyCredits: 0, priceCents: 0 },
  starter: { name: "Starter", monthlyCredits: 1000, priceCents: 2000 },
  pro: { name: "Pro", monthlyCredits: 5000, priceCents: 10000 },
  enterprise: { name: "Enterprise", monthlyCredits: 20000, priceCents: 20000 },
} as const;

export type PlanKey = keyof typeof PLANS;
export type Plan = (typeof PLANS)[PlanKey];
