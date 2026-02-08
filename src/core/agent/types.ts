import { z } from "zod"

export const agentStateSchema = z.enum([
  "idle",
  "thinking",
  "tool_calling",
  "streaming",
  "error",
  "waiting_permission",
])

export type AgentState = z.infer<typeof agentStateSchema>

export const agentEventTypeSchema = z.enum([
  "state_change",
  "message_start",
  "message_delta",
  "message_complete",
  "tool_call_start",
  "tool_call_complete",
  "error",
  "usage_update",
])

export type AgentEventType = z.infer<typeof agentEventTypeSchema>

export const agentEventSchema = z.object({
  type: agentEventTypeSchema,
  data: z.unknown(),
  timestamp: z.number(),
})

export type AgentEvent = z.infer<typeof agentEventSchema>
