import { createContext, useContext } from "solid-js"
import type { Agent } from "../../core/agent/agent.ts"
import type { SessionManager } from "../../core/session/session.ts"
import type { CommandRegistry } from "../../core/commands/registry.ts"
import type { YueConfig } from "../../types/config"
import type { Session } from "../../types/session"
import type { ResolvedTheme } from "../../types/theme"

export interface AppContextValue {
  agent: Agent
  config: YueConfig
  theme: ResolvedTheme
  session: () => Session
  setSession: (s: Session) => void
  sessions: SessionManager
  commands: CommandRegistry
}

export const AppContext = createContext<AppContextValue>()

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error("useApp must be used within AppContext.Provider")
  return ctx
}
