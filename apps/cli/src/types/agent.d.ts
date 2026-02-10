export type AgentState =
  | "idle"
  | "thinking"
  | "tool_calling"
  | "streaming"
  | "error"
  | "waiting_permission"
