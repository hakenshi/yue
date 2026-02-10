import { For, Show } from "solid-js"
import type { Message } from "../../types/llm"
import { useApp } from "../hooks/useApp.ts"
import { ToolCallDisplay } from "./ToolCallDisplay.tsx"

export function ChatMessage(props: { message: Message }) {
  const { theme } = useApp()
  const isUser = () => props.message.role === "user"
  const isAssistant = () => props.message.role === "assistant"

  // Color scheme: User = gray, AI = dark/black
  const backgroundColor = () => {
    if (isUser()) return theme.surface
    if (isAssistant()) return theme.bg
    return theme.surface
  }

  return (
    <box
      id={`msg:${props.message.id}`}
      flexDirection="column"
      width="100%"
      paddingLeft={1}
      paddingRight={1}
      paddingTop={1}
      paddingBottom={1}
      marginBottom={1}
      backgroundColor={backgroundColor()}
    >
      <text selectable wrapMode="word">{props.message.content}</text>
      
      <Show when={props.message.toolCalls}>
        <box paddingTop={1}>
          <For each={props.message.toolCalls}>
            {(tc) => <ToolCallDisplay name={tc.name} input={tc.input} />}
          </For>
        </box>
      </Show>
    </box>
  )
}
