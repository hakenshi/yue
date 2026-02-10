import type { Command } from "../../../types/commands"

export const helpCommand: Command = {
  name: "help",
  description: "List all available commands",
  usage: "/help",
  executor(_parsed, context) {
    const commands = context.commands.getAll()
    const lines = ["Available commands:", ""]
    for (const cmd of commands) {
      const aliasStr = cmd.aliases?.length ? ` (${cmd.aliases.map((a) => `/${a}`).join(", ")})` : ""
      lines.push(`  ${cmd.usage}${aliasStr}`)
      lines.push(`    ${cmd.description}`)
      lines.push("")
    }
    return { success: true, message: lines.join("\n") }
  },
}
