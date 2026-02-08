import { createContext, useContext } from "solid-js"
import type { Agent } from "../../core/agent/agent.ts"
import type { YueConfig } from "../../core/config/schema.ts"
import type { Session } from "../../core/session/types.ts"
import type { ResolvedTheme } from "../theme/colors.ts"

export type AppContextValue = {
  agent: Agent
  config: YueConfig
  theme: ResolvedTheme
  session: () => Session
  setSession: (s: Session) => void
}

export const AppContext = createContext<AppContextValue>()

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error("useApp must be used within AppContext.Provider")
  return ctx
}
