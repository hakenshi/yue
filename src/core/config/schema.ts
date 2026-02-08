import { z } from "zod"

export const yueConfigSchema = z.object({
  provider: z.enum(["anthropic", "openai", "google"]).default("google"),
  model: z.string().default("gemini-2.0-flash"),
  apiKeys: z.record(z.string(), z.string()).default({}),
  personality: z.string().default("yue"),
  maxTokens: z.number().int().positive().default(8192),
  contextMaxPercent: z.number().min(1).max(100).default(75),
  permissions: z.object({
    autoApprove: z.array(z.string()).default([]),
    alwaysAsk: z.array(z.string()).default(["bash", "write", "edit"]),
  }).default({}),
  tddMode: z.boolean().default(false),
  gitStrategy: z.enum(["feature-branch", "trunk"]).default("feature-branch"),
  logLevel: z.enum(["debug", "info", "warn", "error"]).default("info"),
  theme: z.object({
    preset: z.enum(["yue", "dracula", "nord", "gruvbox", "tokyonight", "catppuccin"]).default("yue"),
    opacity: z.number().min(0).max(1).default(1),
    overrides: z.record(z.string(), z.string()).default({}),
  }).default({}),
})

export type YueConfig = z.infer<typeof yueConfigSchema>
