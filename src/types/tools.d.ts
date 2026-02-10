export interface ToolParameter {
  name: string
  type: "string" | "number" | "boolean"
  description: string
  required?: boolean
}

export interface ToolDefinition {
  name: string
  description: string
  parameters: ToolParameter[]
  requiresPermission?: boolean
}

export interface ToolExecutionResult {
  success: boolean
  output: string
  error?: string
}

export type ToolExecutor = (
  args: Record<string, unknown>,
) => Promise<ToolExecutionResult>

export interface Tool {
  definition: ToolDefinition
  execute: ToolExecutor
}
