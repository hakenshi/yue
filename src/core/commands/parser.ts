import type { ParsedCommand } from "../../types/commands"

const SUBCOMMANDS = new Set([
  "list",
  "set",
  "show",
  "add",
  "remove",
  "help",
  "confirm",
  "reject",
  "new",
  "close",
  "pause",
  "resume",
  "logs",
  "attach",
  "kill",
  "status",
  "retry",
  "view",
  "install",
  "enable",
  "disable",
  "create",
  "ps",
  "up",
  "down",
  "rebuild",
  "restart",
  "exec",
  "inspect",
  "compose",
  "clear",
])

function tokenizeCommandLine(input: string): string[] {
  const tokens: string[] = []
  let cur = ""
  let inSingle = false
  let inDouble = false
  let escape = false

  for (let i = 0; i < input.length; i++) {
    const ch = input[i]!

    if (escape) {
      cur += ch
      escape = false
      continue
    }

    if (ch === "\\") {
      // Only treat backslash as escape inside quotes.
      if (inSingle || inDouble) {
        escape = true
        continue
      }
    }

    if (inSingle) {
      if (ch === "'") {
        inSingle = false
      } else {
        cur += ch
      }
      continue
    }

    if (inDouble) {
      if (ch === '"') {
        inDouble = false
      } else {
        cur += ch
      }
      continue
    }

    if (ch === "'") {
      inSingle = true
      continue
    }

    if (ch === '"') {
      inDouble = true
      continue
    }

    if (/\s/.test(ch)) {
      if (cur) {
        tokens.push(cur)
        cur = ""
      }
      continue
    }

    cur += ch
  }

  if (cur) tokens.push(cur)
  return tokens
}

export function isCommand(input: string): boolean {
  return input.trim().startsWith("/")
}

export function parseCommand(input: string): ParsedCommand | null {
  const trimmed = input.trim()
  if (!trimmed.startsWith("/")) return null

  const parts = tokenizeCommandLine(trimmed.slice(1))
  const name = parts[0]
  if (!name) return null

  const rest = parts.slice(1)
  let subcommand: string | undefined
  let args: string[]

  if (rest.length > 0 && SUBCOMMANDS.has(rest[0]!)) {
    subcommand = rest[0]
    args = rest.slice(1)
  } else {
    args = rest
  }

  return { name, subcommand, args, rawInput: trimmed }
}
