import type { Command } from "../../../types/commands"

export const modelCommand: Command = {
  name: "model",
  description: "View or change the active model",
  usage: "/model [set <name>]",
  executor(parsed, context) {
    if (parsed.subcommand === "set") {
      const name = parsed.args[0]
      if (!name) {
        return { success: false, message: "Usage: /model set <name>", error: "Missing model name." }
      }
      context.config.model = name
      return { success: true, message: `Model changed to ${name}` }
    }

    // No subcommand: show current
    return {
      success: true,
      message: `Current model: ${context.config.model}\nProvider: ${context.config.provider}`,
    }
  },
}
