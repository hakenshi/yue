import { z } from "zod"

export const tokenUsageSchema = z.object({
  inputTokens: z.number().optional(),
  outputTokens: z.number().optional(),
})

export type TokenUsage = z.infer<typeof tokenUsageSchema>

export const toolCallSchema = z.object({
  id: z.string(),
  name: z.string(),
  input: z.record(z.string(), z.unknown()),
})

export type ToolCall = z.infer<typeof toolCallSchema>

export const toolResultSchema = z.object({
  toolCallId: z.string(),
  toolName: z.string(),
  result: z.unknown(),
  isError: z.boolean().default(false),
})

export type ToolResult = z.infer<typeof toolResultSchema>

export const messageRoleSchema = z.enum(["system", "user", "assistant", "tool"])

export type MessageRole = z.infer<typeof messageRoleSchema>

export const messageSchema = z.object({
  id: z.string(),
  role: messageRoleSchema,
  content: z.string(),
  toolCalls: z.array(toolCallSchema).optional(),
  toolResults: z.array(toolResultSchema).optional(),
  usage: tokenUsageSchema.optional(),
  createdAt: z.number(),
})

export type Message = z.infer<typeof messageSchema>
