import { createSignal } from "solid-js"
import type { Message } from "../../core/llm/types.ts"
import type { AgentState } from "../../core/agent/types.ts"
import { useApp } from "./useApp.ts"
import { generateId } from "../../utils/id.ts"
import { pushMessage } from "../../core/session/session.ts"

export function useChat() {
  const { agent, session, setSession } = useApp()
  const [input, setInput] = createSignal("")
  const [streamingText, setStreamingText] = createSignal("")
  const [agentState, setAgentState] = createSignal<AgentState>("idle")
  const [permissionRequest, setPermissionRequest] = createSignal<{
    toolName: string
    args: Record<string, unknown>
    resolve: (approved: boolean) => void
  } | null>(null)

  async function send() {
    const text = input().trim()
    if (!text || agentState() !== "idle") return

    setInput("")
    setStreamingText("")

    const userMessage: Message = {
      id: generateId(),
      role: "user",
      content: text,
      createdAt: Date.now(),
    }

    const updated = pushMessage(session(), userMessage)
    setSession(updated)

    setAgentState("thinking")

    await agent.run(updated.messages, {
      onTextDelta(delta) {
        setAgentState("streaming")
        setStreamingText((prev) => prev + delta)
      },
      onToolCall(name, _args) {
        setAgentState("tool_calling")
      },
      onToolResult(_name, _result) {},
      onComplete(assistantMessage) {
        setStreamingText("")
        const withAssistant = pushMessage(session(), assistantMessage)
        setSession(withAssistant)
        setAgentState("idle")
      },
      onError(error) {
        const errorMessage: Message = {
          id: generateId(),
          role: "assistant",
          content: `Error: ${error.message}`,
          createdAt: Date.now(),
        }
        const withError = pushMessage(session(), errorMessage)
        setSession(withError)
        setAgentState("idle")
      },
      onPermissionRequest(toolName, args) {
        return new Promise<boolean>((resolve) => {
          setPermissionRequest({ toolName, args, resolve })
          setAgentState("waiting_permission")
        })
      },
    })
  }

  return {
    input,
    setInput,
    streamingText,
    agentState,
    permissionRequest,
    setPermissionRequest,
    send,
  }
}
