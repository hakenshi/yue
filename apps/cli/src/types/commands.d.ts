import type { Agent } from "../core/agent/agent.ts"
import type { SessionManager } from "../core/session/session.ts"
import type { CommandRegistry } from "../core/commands/registry.ts"
import type { YueConfig } from "./config"
import type { Session } from "./session"

export interface ParsedCommand {
  name: string
  subcommand?: string
  args: string[]
  rawInput: string
}

export interface CommandResult {
  success: boolean
  message: string
  error?: string
}

export interface CommandContext {
  session: Session
  config: YueConfig
  agent: Agent
  setSession: (s: Session) => void
  sessions: SessionManager
  commands: CommandRegistry
  exit: () => void
}

export type CommandExecutor = (
  parsed: ParsedCommand,
  context: CommandContext,
) => CommandResult | Promise<CommandResult>

export interface Command {
  name: string
  aliases?: string[]
  description: string
  usage: string
  executor: CommandExecutor
}
