export interface TokenUsage {
  inputTokens?: number
  outputTokens?: number
}

export interface ToolCall {
  id: string
  name: string
  input: Record<string, unknown>
}

export interface ToolResult {
  toolCallId: string
  toolName: string
  result: unknown
  isError?: boolean
}

export type MessageRole = "system" | "user" | "assistant" | "tool"

export interface Message {
  id: string
  role: MessageRole
  content: string
  toolCalls?: ToolCall[]
  toolResults?: ToolResult[]
  usage?: TokenUsage
  createdAt: number
}
