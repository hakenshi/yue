import type { Command } from "../../../types/commands"

export const quitCommand: Command = {
  name: "quit",
  aliases: ["q"],
  description: "Exit Yue",
  usage: "/quit",
  executor(_parsed, context) {
    context.exit()
    return { success: true, message: "Exiting..." }
  },
}
