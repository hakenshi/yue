import type { Command } from "../../../types/commands"
import { searchProject } from "../../project/search.ts"

function truncate(text: string, max = 14000): string {
  if (text.length <= max) return text
  return text.slice(0, max) + `\n\n...(truncated, ${text.length - max} chars omitted)`
}

export const whereCommand: Command = {
  name: "where",
  aliases: ["search"],
  description: "Search the project for a pattern (no ripgrep required)",
  usage: "/where <pattern> [glob]",
  async executor(parsed) {
    const pattern = parsed.args[0]
    const glob = parsed.args[1]
    if (!pattern) {
      return { success: false, message: "Usage: /where <pattern> [glob]", error: "Missing pattern" }
    }

    const res = await searchProject({ pattern, glob })
    if (res.hits.length === 0) {
      return { success: true, message: "(no matches)" }
    }

    const lines: string[] = []
    for (const h of res.hits) {
      lines.push(`${h.file}:${h.line}:${h.column}: ${h.text}`)
    }
    if (res.truncated) {
      lines.push("")
      lines.push(`(truncated) scannedFiles=${res.scannedFiles} hits=${res.hits.length}`)
    }
    return { success: true, message: truncate(lines.join("\n")) }
  },
}
