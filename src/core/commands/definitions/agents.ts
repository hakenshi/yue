import type { Command } from "../../../types/commands"
import { readAgentsRules, writeAgentsRules } from "../../project/agents.ts"

export const agentsCommand: Command = {
  name: "agents",
  description: "View or set project rules (.yue/agents.md)",
  usage: "/agents [show|set \"text\"|clear]",
  executor(parsed) {
    if (parsed.subcommand === "show") {
      const content = readAgentsRules().trimEnd()
      return { success: true, message: content ? content : "(empty)" }
    }

    if (parsed.subcommand === "set") {
      const text = parsed.args.join(" ").trim()
      if (!text) {
        return { success: false, message: "Usage: /agents set \"text\"", error: "Missing text" }
      }
      writeAgentsRules(text + "\n")
      return { success: true, message: "Updated .yue/agents.md" }
    }

    if (parsed.subcommand === "clear") {
      writeAgentsRules("")
      return { success: true, message: "Cleared .yue/agents.md" }
    }

    // default: show
    const content = readAgentsRules().trimEnd()
    return { success: true, message: content ? content : "(empty)" }
  },
}
