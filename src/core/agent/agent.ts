import type { ModelMessage } from "ai"
import type { YueConfig } from "../../types/config"
import type { Message, TokenUsage } from "../../types/llm"
import type { AgentState } from "../../types/agent"
import type { LLMProvider } from "../llm/provider.ts"
import type { ToolRegistry } from "../tools/registry.ts"
import type { PermissionChecker } from "../permission/permission.ts"
import { buildSystemPrompt } from "./prompt.ts"
import { getPersonality } from "../personality/personalities.ts"
import { streamResponse, type StreamCallbacks } from "../llm/streaming.ts"
import { generateId } from "../../utils/id.ts"
import { readAgentsRules } from "../project/agents.ts"
import { formatOpinionsForPrompt, readOpinions } from "../project/opinions.ts"

const MAX_TOOL_ROUNDS = 10

export class Agent {
  private config: YueConfig
  private provider: LLMProvider
  private tools: ToolRegistry
  private permissions: PermissionChecker
  private _state: AgentState = "idle"

  constructor(config: YueConfig, provider: LLMProvider, tools: ToolRegistry, permissions: PermissionChecker) {
    this.config = config
    this.provider = provider
    this.tools = tools
    this.permissions = permissions
  }

  get state(): AgentState {
    return this._state
  }

  private setState(state: AgentState) {
    this._state = state
  }

  private buildPrompt(): string {
    const base = buildSystemPrompt(getPersonality(this.config.personality))

    const blocks: string[] = [base]

    const opinions = readOpinions()
    if (opinions && opinions.rules.length > 0) {
      blocks.push(
        [
          "## GLOBAL OPINIONS (~/.config/yue/opinions.yml)",
          "",
          formatOpinionsForPrompt(opinions),
          "",
        ].join("\n"),
      )
    }

    const agents = readAgentsRules().trim()
    if (agents) {
      blocks.push(
        [
          "## PROJECT RULES (.yue/agents.md)",
          "",
          agents,
          "",
        ].join("\n"),
      )
    }

    return blocks.join("\n")
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

    const model = this.provider.createModel(this.config.model)
    const systemPrompt = this.buildPrompt()

    const coreMessages: ModelMessage[] = messages.flatMap((m): ModelMessage[] => {
      // Never feed UI/system messages into the model context.
      if (m.role === "system") return []
      if (m.role === "tool" && m.toolResults) {
        return [{
          role: "tool" as const,
          content: m.toolResults.map((tr) => ({
            type: "tool-result" as const,
            toolCallId: tr.toolCallId,
            toolName: tr.toolName,
            output: { type: "text" as const, value: String(tr.result ?? "") },
          })),
        }]
      }
      if (m.role === "assistant" && m.toolCalls && m.toolCalls.length > 0) {
        return [{
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
        }]
      }
      return [{ role: m.role as "user" | "assistant", content: m.content }]
    })

    const aiTools = this.tools.toAISDKTools()
    let fullText = ""
    let totalUsage: TokenUsage = { inputTokens: 0, outputTokens: 0 }

    try {
      for (let round = 0; round < MAX_TOOL_ROUNDS; round++) {
        const collectedToolCalls: { id: string; name: string; input: Record<string, unknown> }[] = []
        let roundText = ""

        const streamCallbacks: StreamCallbacks = {
          onTextDelta(delta) {
            callbacks.onTextDelta(delta)
          },
          onToolCall(tc) {
            collectedToolCalls.push(tc)
            callbacks.onToolCall(tc.name, tc.input)
          },
          onFinish(result) {
            totalUsage.inputTokens = (totalUsage.inputTokens ?? 0) + (result.usage.inputTokens ?? 0)
            totalUsage.outputTokens = (totalUsage.outputTokens ?? 0) + (result.usage.outputTokens ?? 0)
            // Use the SDK-provided full text for this round.
            // This avoids double-appending when providers emit cumulative/overlapping deltas.
            roundText = result.text
          },
          onError(error) {
            callbacks.onError(error)
          },
        }

        this.setState("streaming")
        await streamResponse(
          model,
          coreMessages,
          systemPrompt,
          aiTools,
          this.config.maxTokens,
          streamCallbacks,
        )

        fullText += roundText

        if (collectedToolCalls.length === 0) {
          break
        }

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

        this.setState("tool_calling")
        const toolResults: { toolCallId: string; toolName: string; output: string }[] = []

        for (const tc of collectedToolCalls) {
          const toolDef = this.tools.get(tc.name)
          if (!toolDef) {
            const errMsg = `Error: unknown tool "${tc.name}"`
            callbacks.onToolResult(tc.name, errMsg)
            toolResults.push({ toolCallId: tc.id, toolName: tc.name, output: errMsg })
            continue
          }

          if (toolDef.definition.requiresPermission) {
            this.setState("waiting_permission")
            const permission = this.permissions.check(tc.name)
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

        coreMessages.push({
          role: "tool" as const,
          content: toolResults.map((tr) => ({
            type: "tool-result" as const,
            toolCallId: tr.toolCallId,
            toolName: tr.toolName,
            output: { type: "text" as const, value: tr.output },
          })),
        })
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
