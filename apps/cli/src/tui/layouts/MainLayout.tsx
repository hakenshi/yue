import { Show, createEffect, createMemo, createSignal } from "solid-js"
import { useKeyboard, useSelectionHandler } from "@opentui/solid"
import { StatusBar } from "../components/StatusBar.tsx"
import { ChatView } from "../components/ChatView.tsx"
import { ChatInput } from "../components/ChatInput.tsx"
import { PermissionPrompt } from "../components/PermissionPrompt.tsx"
import { CommandPalette } from "../components/CommandPalette.tsx"
import { CommandPreview } from "../components/CommandPreview.tsx"
import { useChat } from "../hooks/useChat.ts"
import { useApp } from "../hooks/useApp.ts"
import { useViewport } from "../hooks/useViewport.ts"

export function MainLayout() {
  const { theme, session, config } = useApp()
  const viewport = useViewport()

  const [paletteOpen, setPaletteOpen] = createSignal(false)
  const { commands } = useApp()
  const sortedCommands = createMemo(() => commands.getAll().slice().sort((a, b) => a.name.localeCompare(b.name)))

  const isWelcome = () => session().messages.length === 0
  const chat = useChat()


  createEffect(() => {
    const n = chat.helpRequest()
    if (n > 0) {
      setPaletteOpen(true)
    }
  })


  useKeyboard((key) => {
    if (paletteOpen()) {
      if (key.name === "escape") setPaletteOpen(false)
      return
    }

    if (!chat.permissionRequest() && key.ctrl && key.name === "p") {
      setPaletteOpen(true)
      return
    }

    if (!chat.permissionRequest() && chat.hasCommandPreview()) {
      if (key.name === "up") {
        chat.selectPrevCommand()
        return
      }
      if (key.name === "down") {
        chat.selectNextCommand()
        return
      }
      if (key.name === "tab") {
        if (chat.applySelectedCommand()) return
      }
    }

    // Shell-like input history (OpenCode-style)
    if (!chat.permissionRequest() && !chat.hasCommandPreview()) {
      if (key.name === "up" && !key.ctrl && !key.meta && !key.shift) {
        chat.historyPrev()
        return
      }
      if (key.name === "down" && !key.ctrl && !key.meta && !key.shift) {
        chat.historyNext()
        return
      }
    }

    if (key.name === "tab" && !chat.permissionRequest() && !chat.input().trimStart().startsWith("/")) {
      chat.toggleMode()
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
      height={viewport().safeHeight}
      backgroundColor={theme.bg}
      position="relative"
      overflow="hidden"
    >
      <Show when={!isWelcome()} fallback={<box height={0} />}>
        <StatusBar />
      </Show>

      <ChatView
        streamingText={chat.streamingText}
        agentState={chat.agentState}
        inputValue={chat.input}
        onInput={chat.onUserInput}
        onSubmit={chat.send}
        inputFocused={() => !chat.permissionRequest()}
        isWelcome={isWelcome}
        mode={chat.mode}
        modelName={() => config.model}
        commandPreviewOpen={() => !paletteOpen() && !chat.permissionRequest() && chat.hasCommandPreview()}
        commandSuggestions={chat.commandSuggestions}
        commandIndex={chat.commandIndex}
        scrollShortcutsEnabled={() => !paletteOpen() && !chat.permissionRequest()}
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

      <Show when={!isWelcome()} fallback={<box height={0} />}>
        <box flexDirection="column" zIndex={10}>
          <ChatInput
            value={chat.input}
            onInput={chat.onUserInput}
            onSubmit={chat.send}
            mode={chat.mode()}
            modelName={config.model}
            focused={!chat.permissionRequest()}
            commandPreview={
              <CommandPreview
                open={() => !paletteOpen() && !chat.permissionRequest() && chat.hasCommandPreview()}
                commands={chat.commandSuggestions}
                selectedIndex={chat.commandIndex}
              />
            }
          />
        </box>
      </Show>

      {/* Overlay layer: keep modals above all UI (logo, chat, etc.) */}
      <box
        position="absolute"
        left={0}
        right={0}
        top={0}
        bottom={0}
        zIndex={10000}
        overflow="visible"
        shouldFill={false}
      >
        <CommandPalette
          open={paletteOpen}
          commands={sortedCommands}
          onClose={() => setPaletteOpen(false)}
          onSelect={(cmd) => {
            chat.onUserInput(`/${cmd.name} `)
          }}
        />
      </box>
    </box>
  )
}
