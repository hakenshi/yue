import { parseCommand } from "./parser.ts"
import type { CommandContext, CommandResult } from "../../types/commands"

export async function executeCommand(
  input: string,
  context: CommandContext,
): Promise<CommandResult> {
  const parsed = parseCommand(input)
  if (!parsed) {
    return { success: false, message: "Invalid command.", error: "Could not parse command." }
  }

  const command = context.commands.get(parsed.name)
  if (!command) {
    return {
      success: false,
      message: `Unknown command: /${parsed.name}. Type /help to see available commands.`,
      error: `Unknown command: /${parsed.name}`,
    }
  }

  try {
    return await command.executor(parsed, context)
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    return { success: false, message: `Command failed: ${msg}`, error: msg }
  }
}
