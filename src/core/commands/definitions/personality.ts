import type { Command } from "../../../types/commands"
import { PERSONALITIES, getPersonality } from "../../personality/personalities.ts"

export const personalityCommand: Command = {
  name: "personality",
  description: "View or change the active personality",
  usage: "/personality [list|set <name>]",
  executor(parsed, context) {
    if (parsed.subcommand === "list") {
      const lines = ["Available personalities:", ""]
      for (const [key, p] of Object.entries(PERSONALITIES)) {
        const active = key === context.config.personality ? " (active)" : ""
        lines.push(`  ${key}${active} — ${p.description}`)
        lines.push(`    Traits: ${p.traits.slice(0, 80)}...`)
        lines.push("")
      }
      return { success: true, message: lines.join("\n") }
    }

    if (parsed.subcommand === "set") {
      const name = parsed.args[0]
      if (!name) {
        return { success: false, message: "Usage: /personality set <name>", error: "Missing personality name." }
      }
      if (!PERSONALITIES[name]) {
        const available = Object.keys(PERSONALITIES).join(", ")
        return {
          success: false,
          message: `Unknown personality: ${name}. Available: ${available}`,
          error: `Unknown personality: ${name}`,
        }
      }
      context.config.personality = name
      const p = getPersonality(name)
      return { success: true, message: `Personality changed to ${p.name} — ${p.description}` }
    }

    // No subcommand: show current
    const p = getPersonality(context.config.personality)
    return {
      success: true,
      message: `Current personality: ${p.name}\n${p.description}\nTraits: ${p.traits}`,
    }
  },
}
