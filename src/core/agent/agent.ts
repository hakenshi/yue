import type { ModelMessage } from "ai"
import type { YueConfig } from "../config/schema.ts"
import type { Message, TokenUsage } from "../llm/types.ts"
import type { AgentState } from "./types.ts"
import { buildSystemPrompt } from "./prompt.ts"
import { getPersonality } from "../personality/personalities.ts"
import { streamResponse, type StreamCallbacks } from "../llm/streaming.ts"
import { toAISDKTools, getTool } from "../tools/registry.ts"
import { checkPermission } from "../permission/permission.ts"
import { generateId } from "../../utils/id.ts"
import { bus } from "../events.ts"
import { createLogger } from "../../utils/logger.ts"

const log = createLogger("agent")
const MAX_TOOL_ROUNDS = 10

export class Agent {
  private config: YueConfig
  private model: unknown
  private systemPrompt: string
  private _state: AgentState = "idle"

  constructor(config: YueConfig, model: unknown) {
    this.config = config
    this.model = model
    const personality = getPersonality(config.personality)
    this.systemPrompt = buildSystemPrompt(personality)
  }

  get state(): AgentState {
    return this._state
  }

  private setState(state: AgentState) {
    this._state = state
    bus.emit("agent:state", state)
  }

  async run(
    messages: Message[],
    callbacks: {
      onTextDelta: (delta: string) => void
      onToolCall: (name: string, input: Record<string, unknown>) => void
      onToolResult: (name: string, result: string) => void
      onComplete: (assistantMessage: Message) => void
      onError: (error: Error) => void
      onPermissionRequest: (toolName: string, input: Record<string, unknown>) => Promise<boolean>
    },
  ) {
    this.setState("thinking")

    const coreMessages: ModelMessage[] = messages.map((m): ModelMessage => {
      if (m.role === "tool" && m.toolResults) {
        return {
          role: "tool" as const,
          content: m.toolResults.map((tr) => ({
            type: "tool-result" as const,
            toolCallId: tr.toolCallId,
            toolName: tr.toolName,
            output: { type: "text" as const, value: String(tr.result ?? "") },
          })),
        }
      }
      if (m.role === "assistant" && m.toolCalls && m.toolCalls.length > 0) {
        return {
          role: "assistant" as const,
          content: [
            ...(m.content ? [{ type: "text" as const, text: m.content }] : []),
            ...m.toolCalls.map((tc) => ({
              type: "tool-call" as const,
              toolCallId: tc.id,
              toolName: tc.name,
              input: tc.input,
            })),
          ],
        }
      }
      return { role: m.role as "user" | "assistant", content: m.content }
    })

    const aiTools = toAISDKTools()
    let fullText = ""
    let totalUsage: TokenUsage = { inputTokens: 0, outputTokens: 0 }

    try {
      for (let round = 0; round < MAX_TOOL_ROUNDS; round++) {
        const collectedToolCalls: { id: string; name: string; input: Record<string, unknown> }[] = []
        let roundText = ""

        const streamCallbacks: StreamCallbacks = {
          onTextDelta(delta) {
            roundText += delta
            callbacks.onTextDelta(delta)
          },
          onToolCall(tc) {
            collectedToolCalls.push(tc)
            callbacks.onToolCall(tc.name, tc.input)
          },
          onFinish(result) {
            totalUsage.inputTokens = (totalUsage.inputTokens ?? 0) + (result.usage.inputTokens ?? 0)
            totalUsage.outputTokens = (totalUsage.outputTokens ?? 0) + (result.usage.outputTokens ?? 0)
          },
          onError(error) {
            log.error("Stream error", error)
          },
        }

        this.setState(round === 0 ? "streaming" : "streaming")
        await streamResponse(
          this.model,
          coreMessages,
          this.systemPrompt,
          aiTools,
          this.config.maxTokens,
          streamCallbacks,
        )

        fullText += roundText

        if (collectedToolCalls.length === 0) {
          break
        }

        // Add assistant message with tool calls to conversation
        coreMessages.push({
          role: "assistant" as const,
          content: [
            ...(roundText ? [{ type: "text" as const, text: roundText }] : []),
            ...collectedToolCalls.map((tc) => ({
              type: "tool-call" as const,
              toolCallId: tc.id,
              toolName: tc.name,
              input: tc.input,
            })),
          ],
        })

        // Execute tools and collect results
        this.setState("tool_calling")
        const toolResults: { toolCallId: string; toolName: string; output: string }[] = []

        for (const tc of collectedToolCalls) {
          const toolDef = getTool(tc.name)
          if (!toolDef) {
            const errMsg = `Error: unknown tool "${tc.name}"`
            callbacks.onToolResult(tc.name, errMsg)
            toolResults.push({ toolCallId: tc.id, toolName: tc.name, output: errMsg })
            continue
          }

          if (toolDef.definition.requiresPermission) {
            this.setState("waiting_permission")
            const permission = await checkPermission(this.config, tc.name, tc.input)
            if (permission === "pending") {
              const approved = await callbacks.onPermissionRequest(tc.name, tc.input)
              if (!approved) {
                const denied = "Permission denied by user"
                callbacks.onToolResult(tc.name, denied)
                toolResults.push({ toolCallId: tc.id, toolName: tc.name, output: denied })
                continue
              }
            } else if (permission === "denied") {
              const denied = "Permission denied"
              callbacks.onToolResult(tc.name, denied)
              toolResults.push({ toolCallId: tc.id, toolName: tc.name, output: denied })
              continue
            }
          }

          this.setState("tool_calling")
          const result = await toolDef.execute(tc.input)
          const output = result.output || result.error || ""
          callbacks.onToolResult(tc.name, output)
          toolResults.push({ toolCallId: tc.id, toolName: tc.name, output })
        }

        // Add tool results to conversation so the LLM can see them
        coreMessages.push({
          role: "tool" as const,
          content: toolResults.map((tr) => ({
            type: "tool-result" as const,
            toolCallId: tr.toolCallId,
            toolName: tr.toolName,
            output: { type: "text" as const, value: tr.output },
          })),
        })

        // Reset for next round
        fullText += ""
      }

      const assistantMessage: Message = {
        id: generateId(),
        role: "assistant",
        content: fullText,
        usage: totalUsage,
        createdAt: Date.now(),
      }

      this.setState("idle")
      callbacks.onComplete(assistantMessage)
    } catch (error) {
      this.setState("error")
      callbacks.onError(error instanceof Error ? error : new Error(String(error)))
    }
  }
}
