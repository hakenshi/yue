import type { Command } from "../../../types/commands"

export const clearCommand: Command = {
  name: "clear",
  description: "Clear chat and start a new session",
  usage: "/clear",
  executor(_parsed, context) {
    const session = context.sessions.create()
    context.setSession(session)
    return { success: true, message: "Session cleared." }
  },
}
