import type { Command } from "../../../types/commands"
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs"
import { join } from "path"

function ensureDir(path: string) {
  if (!existsSync(path)) mkdirSync(path, { recursive: true })
}

function normalizeLine(s: string): string {
  return s.replace(/\r\n/g, "\n").replace(/\r/g, "\n")
}

export const memoryCommand: Command = {
  name: "memory",
  description: "Manage project memory (.yue/memory.yml)",
  usage: "/memory add \"constraint or pattern\"",
  executor(parsed) {
    const root = join(process.cwd(), ".yue")
    ensureDir(root)
    const filePath = join(root, "memory.yml")

    const verb = parsed.subcommand ?? parsed.args[0]
    const rest = parsed.subcommand ? parsed.args : parsed.args.slice(1)

    if (verb === "add") {
      const text = rest.join(" ").trim()
      if (!text) {
        return { success: false, message: "Usage: /memory add \"constraint or pattern\"", error: "Missing text." }
      }

      const existing = existsSync(filePath) ? normalizeLine(readFileSync(filePath, "utf-8")).trimEnd() : ""
      const line = `- ${JSON.stringify(text)}`
      const next = existing ? `${existing}\n${line}\n` : `${line}\n`
      writeFileSync(filePath, next, "utf-8")
      return { success: true, message: "Memory added to .yue/memory.yml" }
    }

    if (verb === "confirm" || verb === "reject") {
      return {
        success: false,
        message: `/${parsed.name} ${verb} is not implemented yet (auto-extracted decisions not wired). Use /memory add for now.`,
        error: "Not implemented",
      }
    }

    return { success: false, message: "Usage: /memory add \"...\"", error: "Unknown subcommand" }
  },
}
