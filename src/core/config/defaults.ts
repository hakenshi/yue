import type { YueConfig } from "./schema.ts"

export const DEFAULT_CONFIG: YueConfig = {
  provider: "google",
  model: "gemini-2.0-flash",
  apiKeys: {},
  personality: "yue",
  maxTokens: 8192,
  contextMaxPercent: 75,
  permissions: {
    autoApprove: [],
    alwaysAsk: ["bash", "write", "edit"],
  },
  tddMode: false,
  gitStrategy: "feature-branch",
  logLevel: "info",
  theme: {
    preset: "yue",
    opacity: 1,
    overrides: {},
  },
}
