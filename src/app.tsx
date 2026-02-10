import { createSignal } from "solid-js"
import { AppContext, type AppContextValue } from "./tui/hooks/useApp.ts"
import { MainLayout } from "./tui/layouts/MainLayout.tsx"
import { Agent } from "./core/agent/agent.ts"
import { createProvider } from "./core/llm/provider.ts"
import { loadConfig } from "./core/config/loader.ts"
import { SessionManager } from "./core/session/session.ts"
import { ToolRegistry } from "./core/tools/registry.ts"
import { PermissionChecker } from "./core/permission/permission.ts"
import { CommandRegistry } from "./core/commands/registry.ts"
import { bashTool } from "./core/tools/bash.ts"
import { readTool } from "./core/tools/read.ts"
import { writeTool } from "./core/tools/write.ts"
import { editTool } from "./core/tools/edit.ts"
import { globTool } from "./core/tools/glob.ts"
import { grepTool } from "./core/tools/grep.ts"
import { resolveTheme } from "./tui/theme/colors.ts"
import type { Session } from "./types/session"
import { helpCommand } from "./core/commands/definitions/help.ts"
import { quitCommand } from "./core/commands/definitions/quit.ts"
import { clearCommand } from "./core/commands/definitions/clear.ts"
import { personalityCommand } from "./core/commands/definitions/personality.ts"
import { tokensCommand } from "./core/commands/definitions/tokens.ts"
import { modelCommand } from "./core/commands/definitions/model.ts"
import { skipPermissionsCommand } from "./core/commands/definitions/skip-permissions.ts"
import { diffCommand } from "./core/commands/definitions/diff.ts"
import { initCommand } from "./core/commands/definitions/init.ts"
import { adrCommand } from "./core/commands/definitions/adr.ts"
import { memoryCommand } from "./core/commands/definitions/memory.ts"
import { reviewCommand } from "./core/commands/definitions/review.ts"
import { securityCommand } from "./core/commands/definitions/security.ts"
import { perfCommand } from "./core/commands/definitions/perf.ts"
import { agentsCommand } from "./core/commands/definitions/agents.ts"
import { opinionsCommand } from "./core/commands/definitions/opinions.ts"
import { fileCommand } from "./core/commands/definitions/file.ts"
import { whereCommand } from "./core/commands/definitions/where.ts"

export function App() {
  const config = loadConfig()
  const provider = createProvider(config)
  const theme = resolveTheme(config)

  const tools = new ToolRegistry()
  tools.register(bashTool)
  tools.register(readTool)
  tools.register(writeTool)
  tools.register(editTool)
  tools.register(globTool)
  tools.register(grepTool)

  const commands = new CommandRegistry()
  commands.register(helpCommand)
  commands.register(quitCommand)
  commands.register(clearCommand)
  commands.register(personalityCommand)
  commands.register(tokensCommand)
  commands.register(modelCommand)
  commands.register(skipPermissionsCommand)
  commands.register(diffCommand)
  commands.register(initCommand)
  commands.register(adrCommand)
  commands.register(memoryCommand)
  commands.register(reviewCommand)
  commands.register(securityCommand)
  commands.register(perfCommand)
  commands.register(agentsCommand)
  commands.register(opinionsCommand)
  commands.register(fileCommand)
  commands.register(whereCommand)

  const sessions = new SessionManager()
  const permissions = new PermissionChecker(config)
  const agent = new Agent(config, provider, tools, permissions)

  const [session, setSession] = createSignal<Session>(sessions.create())

  const ctx: AppContextValue = {
    agent,
    config,
    theme,
    session,
    setSession,
    sessions,
    commands,
  }

  return (
    <AppContext.Provider value={ctx}>
      <MainLayout />
    </AppContext.Provider>
  )
}
