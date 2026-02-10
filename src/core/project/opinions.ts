import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs"
import { join } from "path"
import yaml from "js-yaml"

export type OpinionRuleLevel = "error" | "warn" | "info"

export interface OpinionRule {
  id: string
  level: OpinionRuleLevel
  text: string
}

export interface OpinionsFile {
  version: number
  rules: OpinionRule[]
}

function globalConfigDir(): string {
  return join(
    process.env.XDG_CONFIG_HOME || join(process.env.HOME || "~", ".config"),
    "yue",
  )
}

export function opinionsPath(): string {
  return join(globalConfigDir(), "opinions.yml")
}

export function readOpinionsRaw(): string {
  const path = opinionsPath()
  if (!existsSync(path)) return ""
  try {
    return readFileSync(path, "utf-8")
  } catch {
    return ""
  }
}

export function readOpinions(): OpinionsFile | null {
  const raw = readOpinionsRaw()
  if (!raw.trim()) return null

  try {
    const doc = (yaml.load(raw) as any) ?? null
    if (!doc || typeof doc !== "object") return null
    if (typeof doc.version !== "number") return null
    if (!Array.isArray(doc.rules)) return null

    const rules: OpinionRule[] = doc.rules
      .filter((r: any) => r && typeof r.id === "string" && typeof r.text === "string")
      .map((r: any) => ({
        id: r.id,
        level: r.level === "warn" || r.level === "info" || r.level === "error" ? r.level : "error",
        text: r.text,
      }))

    return { version: doc.version, rules }
  } catch {
    return null
  }
}

export function writeOpinions(file: OpinionsFile) {
  const dir = globalConfigDir()
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true })
  const content = yaml.dump(file, { lineWidth: 100 })
  writeFileSync(opinionsPath(), content, "utf-8")
}

export function defaultOpinions(): OpinionsFile {
  return {
    version: 1,
    rules: [
      {
        id: "no_rename_without_request",
        level: "error",
        text: "Never rename or move files unless the user explicitly asks. If a rename seems beneficial, ask first.",
      },
      {
        id: "no_surprise_nextjs_middleware",
        level: "error",
        text: "Never introduce or rename files to Next.js conventions (e.g. middleware.ts) unless explicitly requested. Verify framework expectations before changes.",
      },
      {
        id: "minimal_change_surface",
        level: "error",
        text: "Prefer minimal diffs. Do not refactor or reorganize code unless explicitly asked.",
      },
    ],
  }
}

export function formatOpinionsForPrompt(opinions: OpinionsFile): string {
  const lines: string[] = []
  for (const r of opinions.rules) {
    lines.push(`- [${r.level}] ${r.id}: ${r.text}`)
  }
  return lines.join("\n")
}
