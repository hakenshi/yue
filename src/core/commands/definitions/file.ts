import type { Command } from "../../../types/commands"
import { readFileSync, statSync } from "fs"
import { resolve } from "path"

function formatLines(lines: string[], startLine: number): string {
  const out: string[] = []
  for (let i = 0; i < lines.length; i++) {
    const n = startLine + i
    let line = lines[i] ?? ""
    if (line.length > 400) line = line.slice(0, 400) + "…"
    out.push(`${String(n).padStart(5, " ")} | ${line}`)
  }
  return out.join("\n")
}

export const fileCommand: Command = {
  name: "file",
  description: "View a file with line numbers",
  usage: "/file <path> [start] [limit]",
  executor(parsed) {
    const pathArg = parsed.args[0]
    if (!pathArg) {
      return { success: false, message: "Usage: /file <path> [start] [limit]", error: "Missing path" }
    }

    const abs = resolve(process.cwd(), pathArg)
    let st
    try {
      st = statSync(abs)
    } catch {
      return { success: false, message: `File not found: ${abs}`, error: "Not found" }
    }
    if (!st.isFile()) {
      return { success: false, message: `Not a file: ${abs}`, error: "Not a file" }
    }
    if (st.size > 1024 * 1024) {
      return { success: false, message: `File too large (>1MB): ${abs}`, error: "Too large" }
    }

    const start = Math.max(1, Number(parsed.args[1] ?? 1) || 1)
    const limit = Math.min(500, Math.max(1, Number(parsed.args[2] ?? 200) || 200))

    const content = readFileSync(abs, "utf-8")
    const all = content.split("\n")
    const slice = all.slice(start - 1, start - 1 + limit)
    const header = `${abs}\n(lines ${start}-${start + slice.length - 1} of ${all.length})\n`
    return { success: true, message: header + formatLines(slice, start) }
  },
}
