import type { Command } from "../../../types/commands"

export const tokensCommand: Command = {
  name: "tokens",
  description: "Show token usage for the current session",
  usage: "/tokens",
  executor(_parsed, context) {
    const { totalTokens, messages } = context.session
    const msgCount = messages.length
    return {
      success: true,
      message: `Session stats:\n  Messages: ${msgCount}\n  Total tokens: ${totalTokens}`,
    }
  },
}
