import { readFileSync, existsSync } from "fs"
import { join } from "path"
import yaml from "js-yaml"
import { yueConfigSchema } from "./schema.ts"
import type { YueConfig } from "../../types/config"
import { DEFAULT_CONFIG } from "./defaults.ts"

const GLOBAL_CONFIG_DIR = join(
  process.env.XDG_CONFIG_HOME || join(process.env.HOME || "~", ".config"),
  "yue",
)
const GLOBAL_CONFIG_PATH = join(GLOBAL_CONFIG_DIR, "config.yml")
const LOCAL_CONFIG_PATH = join(process.cwd(), ".yue", "config.yml")

function loadYamlFile(path: string): Record<string, unknown> | null {
  if (!existsSync(path)) return null
  try {
    const content = readFileSync(path, "utf-8")
    return (yaml.load(content) as Record<string, unknown>) ?? null
  } catch {
    return null
  }
}

export function loadConfig(): YueConfig {
  const globalRaw = loadYamlFile(GLOBAL_CONFIG_PATH) ?? {}
  const localRaw = loadYamlFile(LOCAL_CONFIG_PATH) ?? {}

  const merged = {
    ...DEFAULT_CONFIG,
    ...globalRaw,
    ...localRaw,
    permissions: {
      ...DEFAULT_CONFIG.permissions,
      ...(globalRaw.permissions as Record<string, unknown> | undefined),
      ...(localRaw.permissions as Record<string, unknown> | undefined),
    },
    apiKeys: {
      ...DEFAULT_CONFIG.apiKeys,
      ...(globalRaw.apiKeys as Record<string, string> | undefined),
      ...(localRaw.apiKeys as Record<string, string> | undefined),
    },
    theme: {
      ...DEFAULT_CONFIG.theme,
      ...((globalRaw.theme as Record<string, unknown> | undefined) ?? {}),
      ...((localRaw.theme as Record<string, unknown> | undefined) ?? {}),
      overrides: {
        ...DEFAULT_CONFIG.theme.overrides,
        ...((globalRaw.theme as any)?.overrides ?? {}),
        ...((localRaw.theme as any)?.overrides ?? {}),
      },
    },
  }

  const result = yueConfigSchema.safeParse(merged)
  if (!result.success) {
    return DEFAULT_CONFIG
  }

  return result.data
}

export function getApiKey(config: YueConfig, provider?: string): string | undefined {
  const p = provider ?? config.provider
  const envKey = config.apiKeys[p] ?? process.env[`${p.toUpperCase()}_API_KEY`]
  if (envKey) return envKey

  if (p === "google") {
    return process.env.GOOGLE_GENERATIVE_AI_KEY ?? process.env.GOOGLE_API_KEY
  }

  return undefined
}
