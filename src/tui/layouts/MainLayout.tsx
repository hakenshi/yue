import { Show } from "solid-js"
import { useKeyboard, useSelectionHandler } from "@opentui/solid"
import { StatusBar } from "../components/StatusBar.tsx"
import { ChatView } from "../components/ChatView.tsx"
import { InputBar } from "../components/InputBar.tsx"
import { PermissionPrompt } from "../components/PermissionPrompt.tsx"
import { useChat } from "../hooks/useChat.ts"
import { useApp } from "../hooks/useApp.ts"

export function MainLayout() {
  const { theme, session } = useApp()

  const isWelcome = () => session().messages.length === 0
  const chat = useChat()

  useKeyboard((key) => {
    if (key.name === "return" && !chat.permissionRequest()) {
      chat.send()
    }
  })

  useSelectionHandler((selection) => {
    const text = selection.getSelectedText()
    if (!text) return
    const candidates =
      process.env.XDG_SESSION_TYPE === "wayland"
        ? [["wl-copy"], ["xsel", "--clipboard", "--input"], ["xclip", "-selection", "clipboard"]]
        : [["xsel", "--clipboard", "--input"], ["xclip", "-selection", "clipboard"]]
    for (const cmd of candidates) {
      try {
        const proc = Bun.spawn(cmd, { stdin: "pipe" })
        proc.stdin.write(text)
        proc.stdin.end()
        break
      } catch {
        continue
      }
    }
  })

  return (
    <box
      flexDirection="column"
      width="100%"
      height="100%"
      backgroundColor={theme.bg}
    >
      <Show when={!isWelcome()}>
        <StatusBar />
      </Show>

      <ChatView
        streamingText={chat.streamingText}
        agentState={chat.agentState}
        inputValue={chat.input}
        onInput={chat.setInput}
        inputFocused={!chat.permissionRequest()}
        isWelcome={isWelcome()}
      />

      <Show when={chat.permissionRequest()}>
        {(req: () => NonNullable<ReturnType<typeof chat.permissionRequest>>) => (
          <PermissionPrompt
            toolName={req().toolName}
            args={req().args}
            onResolve={(approved: boolean) => {
              req().resolve(approved)
              chat.setPermissionRequest(null)
            }}
          />
        )}
      </Show>

      <Show when={!isWelcome()}>
        <InputBar
          value={chat.input}
          onInput={chat.setInput}
          onSubmit={chat.send}
          focused={!chat.permissionRequest()}
        />
      </Show>
    </box>
  )
}
