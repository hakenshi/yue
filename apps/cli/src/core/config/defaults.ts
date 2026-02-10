import type { YueConfig } from "../../types/config"

export const DEFAULT_CONFIG: YueConfig = {
  provider: "google",
  model: "gemini-2.0-flash",
  apiKeys: {},
  personality: "yue",
  maxTokens: 8192,
  permissions: {
    autoApprove: [],
    alwaysAsk: ["bash", "write", "edit"],
  },
  logLevel: "info",
  theme: {
    preset: "yue",
    opacity: 1,
    overrides: {},
  },
}
