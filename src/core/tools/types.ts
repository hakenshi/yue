import { z } from "zod"

export const toolParameterSchema = z.object({
  name: z.string(),
  type: z.enum(["string", "number", "boolean"]),
  description: z.string(),
  required: z.boolean().default(true),
})

export type ToolParameter = z.infer<typeof toolParameterSchema>

export const toolDefinitionSchema = z.object({
  name: z.string(),
  description: z.string(),
  parameters: z.array(toolParameterSchema),
  requiresPermission: z.boolean().default(true),
})

export type ToolDefinition = z.infer<typeof toolDefinitionSchema>

export const toolExecutionResultSchema = z.object({
  success: z.boolean(),
  output: z.string(),
  error: z.string().optional(),
})

export type ToolExecutionResult = z.infer<typeof toolExecutionResultSchema>

export type ToolExecutor = (
  args: Record<string, unknown>,
) => Promise<ToolExecutionResult>

export type Tool = {
  definition: ToolDefinition
  execute: ToolExecutor
}
