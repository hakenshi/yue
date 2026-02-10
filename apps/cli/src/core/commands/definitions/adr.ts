import type { Command } from "../../../types/commands"
import { existsSync, mkdirSync, readdirSync, writeFileSync } from "fs"
import { join } from "path"

function ensureDir(path: string) {
  if (!existsSync(path)) mkdirSync(path, { recursive: true })
}

function slugify(s: string): string {
  return s
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 60) || "adr"
}

export const adrCommand: Command = {
  name: "adr",
  description: "Create or list Architecture Decision Records",
  usage: "/adr [list|\"description\"]",
  executor(parsed) {
    const adrsDir = join(process.cwd(), ".yue", "adrs")
    ensureDir(adrsDir)

    if (parsed.subcommand === "list") {
      const files = readdirSync(adrsDir).filter((f) => f.endsWith(".md")).sort()
      if (files.length === 0) return { success: true, message: "No ADRs found in .yue/adrs." }
      return { success: true, message: ["ADRs:", ...files.map((f) => `  ${f}`)].join("\n") }
    }

    const description = parsed.args.join(" ").trim()
    if (!description) {
      return { success: false, message: "Usage: /adr \"description\" or /adr list", error: "Missing description." }
    }

    const now = new Date()
    const stamp = now.toISOString().slice(0, 10).replace(/-/g, "")
    const fileName = `${stamp}-${slugify(description)}.md`
    const fullPath = join(adrsDir, fileName)

    const content = `# ADR: ${description}\n\n- Date: ${now.toISOString()}\n\n## Context\n\n## Decision\n\n## Consequences\n\n`
    writeFileSync(fullPath, content, "utf-8")
    return { success: true, message: `ADR created: .yue/adrs/${fileName}` }
  },
}
