import { createSignal } from "solid-js"
import { AppContext, type AppContextValue } from "./tui/hooks/useApp.ts"
import { MainLayout } from "./tui/layouts/MainLayout.tsx"
import { Agent } from "./core/agent/agent.ts"
import { createProvider } from "./core/llm/provider.ts"
import { loadConfig } from "./core/config/loader.ts"
import { newSession } from "./core/session/session.ts"
import { registerTool } from "./core/tools/registry.ts"
import { bashTool } from "./core/tools/bash.ts"
import { readTool } from "./core/tools/read.ts"
import { writeTool } from "./core/tools/write.ts"
import { editTool } from "./core/tools/edit.ts"
import { globTool } from "./core/tools/glob.ts"
import { grepTool } from "./core/tools/grep.ts"
import { resolveTheme } from "./tui/theme/colors.ts"
import type { Session } from "./core/session/types.ts"

export function App() {
  const config = loadConfig()
  const model = createProvider(config)
  const agent = new Agent(config, model)
  const theme = resolveTheme(config)

  registerTool(bashTool)
  registerTool(readTool)
  registerTool(writeTool)
  registerTool(editTool)
  registerTool(globTool)
  registerTool(grepTool)

  const [session, setSession] = createSignal<Session>(newSession())

  const ctx: AppContextValue = {
    agent,
    config,
    theme,
    session,
    setSession,
  }

  return (
    <AppContext.Provider value={ctx}>
      <MainLayout />
    </AppContext.Provider>
  )
}
