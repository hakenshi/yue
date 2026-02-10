import { streamText, type ModelMessage } from "ai"
import type { AnyModel } from "./provider.ts"
import type { TokenUsage } from "../../types/llm"

export interface StreamCallbacks {
  onTextDelta: (delta: string) => void
  onToolCall: (toolCall: { id: string; name: string; input: Record<string, unknown> }) => void
  onFinish: (result: { text: string; usage: TokenUsage }) => void
  onError: (error: Error) => void
}

export async function streamResponse(
  model: AnyModel,
  messages: ModelMessage[],
  systemPrompt: string,
  tools: Record<string, unknown>,
  maxOutputTokens: number,
  callbacks: StreamCallbacks,
) {
  try {
    // model may be LanguageModelV1 from older provider SDKs;
    // streamText handles the v1→v3 conversion internally
    const result = streamText({
      model: model as any,
      system: systemPrompt,
      messages,
      tools: tools as any,
      maxOutputTokens,
    })

    for await (const part of result.fullStream) {
      if (part.type === "text-delta") {
        callbacks.onTextDelta(part.text)
      } else if (part.type === "tool-call") {
        callbacks.onToolCall({
          id: part.toolCallId,
          name: part.toolName,
          input: (part.input ?? {}) as Record<string, unknown>,
        })
      } else if (part.type === "error") {
        callbacks.onError(part.error instanceof Error ? part.error : new Error(String(part.error)))
      }
    }

    const usage = await result.usage
    const text = await result.text

    callbacks.onFinish({
      text,
      usage: {
        inputTokens: usage.inputTokens,
        outputTokens: usage.outputTokens,
      },
    })
  } catch (error) {
    callbacks.onError(error instanceof Error ? error : new Error(String(error)))
  }
}
