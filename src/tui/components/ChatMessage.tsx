import { For, Show } from "solid-js"
import type { Message } from "../../core/llm/types.ts"
import { useApp } from "../hooks/useApp.ts"
import { ToolCallDisplay } from "./ToolCallDisplay.tsx"

const ICON_USER = "\uF007"
const ICON_YUE = "\uF186"

function timeAgo(ts: number): string {
  const diff = Math.floor((Date.now() - ts) / 1000)
  if (diff < 10) return "just now"
  if (diff < 60) return `${diff}s ago`
  const mins = Math.floor(diff / 60)
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

export function ChatMessage(props: { message: Message }) {
  const { theme } = useApp()
  const isUser = () => props.message.role === "user"
  const isAssistant = () => props.message.role === "assistant"
  const label = () => (isUser() ? `${ICON_USER} You` : `${ICON_YUE} Yue`)
  const labelColor = () => (isUser() ? theme.secondary : theme.accent)

  return (
    <box
      flexDirection="column"
      paddingLeft={2}
      paddingRight={2}
      paddingTop={1}
      paddingBottom={1}
      marginLeft={1}
      marginRight={1}
      marginBottom={1}
      backgroundColor={isAssistant() ? theme.surface : undefined}
    >
      <box flexDirection="row" justifyContent="space-between">
        <text fg={labelColor()}>
          <strong>{label()}</strong>
        </text>
        <Show when={props.message.createdAt}>
          <text fg={theme.border}>{timeAgo(props.message.createdAt)}</text>
        </Show>
      </box>
      <box paddingLeft={3} paddingTop={1}>
        <text selectable>{props.message.content}</text>
      </box>
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
