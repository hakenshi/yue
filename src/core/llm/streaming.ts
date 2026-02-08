import { streamText, type ModelMessage } from "ai"
import type { TokenUsage } from "./types.ts"

export interface StreamCallbacks {
  onTextDelta: (delta: string) => void
  onToolCall: (toolCall: { id: string; name: string; input: Record<string, unknown> }) => void
  onFinish: (result: { text: string; usage: TokenUsage }) => void
  onError: (error: Error) => void
}

export async function streamResponse(
  model: unknown,
  messages: ModelMessage[],
  systemPrompt: string,
  tools: Record<string, unknown>,
  maxOutputTokens: number,
  callbacks: StreamCallbacks,
) {
  try {
    const result = streamText({
      model: model as any,
      system: systemPrompt,
      messages,
      tools: tools as any,
      maxOutputTokens,
    })

    for await (const part of result.fullStream) {
      switch (part.type) {
        case "text-delta":
          callbacks.onTextDelta((part as any).text ?? (part as any).textDelta ?? "")
          break
        case "tool-call":
          callbacks.onToolCall({
            id: (part as any).toolCallId,
            name: (part as any).toolName,
            input: (part as any).input ?? (part as any).args ?? {},
          })
          break
        case "error":
          callbacks.onError((part as any).error instanceof Error ? (part as any).error : new Error(String((part as any).error)))
          break
      }
    }

    const usage = await result.usage
    const text = await result.text

    callbacks.onFinish({
      text,
      usage: {
        inputTokens: (usage as any).inputTokens ?? (usage as any).promptTokens,
        outputTokens: (usage as any).outputTokens ?? (usage as any).completionTokens,
      },
    })
  } catch (error) {
    callbacks.onError(error instanceof Error ? error : new Error(String(error)))
  }
}
