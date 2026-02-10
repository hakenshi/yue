import { For, Show, createEffect, createSignal } from "solid-js"
import { useKeyboard } from "@opentui/solid"
import type { ScrollBoxRenderable } from "@opentui/core"
import { useApp } from "../hooks/useApp.ts"
import { useResponsive } from "../hooks/useViewport.ts"
import { ChatMessage } from "./ChatMessage.tsx"
import { Spinner } from "./Spinner.tsx"
import { ChatInput } from "./ChatInput.tsx"
import type { AgentState } from "../../types/agent"
import { shortCwd } from "../../utils/path.ts"
import pkg from "../../../package.json"
import type { Command } from "../../types/commands"
import { CommandPreview } from "./CommandPreview.tsx"

const DOT = "\u00B7"

const YUE_LOGO_RAW = [
  "\u2584\u2584\u2584   \u2584\u2584\u2584 \u2584\u2584\u2584  \u2584\u2584\u2584 \u2584\u2584\u2584\u2584\u2584\u2584\u2584\u2584",
  "\u2588\u2588\u2588   \u2588\u2588\u2588 \u2588\u2588\u2588  \u2588\u2588\u2588 \u2588\u2588\u2588\u2580\u2580\u2580\u2580\u2580",
  "\u2580\u2588\u2588\u2588\u2584\u2588\u2588\u2588\u2580 \u2588\u2588\u2588  \u2588\u2588\u2588 \u2588\u2588\u2588\u2584\u2584  ",
  "  \u2580\u2588\u2588\u2588\u2580   \u2588\u2588\u2588\u2584\u2584\u2588\u2588\u2588 \u2588\u2588\u2588    ",
  "   \u2588\u2588\u2588    \u2580\u2588\u2588\u2588\u2588\u2588\u2588\u2580 \u2580\u2588\u2588\u2588\u2588\u2588\u2588\u2588",
]
const LOGO_WIDTH = Math.max(...YUE_LOGO_RAW.map((l) => l.length))
const YUE_LOGO = YUE_LOGO_RAW.map((l) => l.padEnd(LOGO_WIDTH))


function logoGradient(theme: any): string[] {
  // Use theme tokens so presets/overrides apply consistently.
  return [
    String(theme.secondary),
    String(theme.secondary),
    String(theme.accent),
    String(theme.accentDim),
    String(theme.accentDim),
  ]
}

export function ChatView(props: {
  streamingText: () => string
  agentState: () => AgentState
  inputValue: () => string
  onInput: (v: string) => void
  onSubmit: () => void
  inputFocused: () => boolean
  isWelcome: () => boolean
  mode: () => "plan" | "build"
  modelName: () => string
  commandPreviewOpen: () => boolean
  commandSuggestions: () => Command[]
  commandIndex: () => number
  scrollShortcutsEnabled: () => boolean
}) {
  const { session, theme } = useApp()
  const { isCompact, isWide } = useResponsive()
  const grad = () => logoGradient(theme)

  let feedRef: ScrollBoxRenderable | undefined
  const [autoFollow, setAutoFollow] = createSignal(true)


  const isNearBottom = () => {
    if (!feedRef) return true
    // Treat within last 2 rows as "at bottom".
    return feedRef.scrollTop + feedRef.height >= feedRef.scrollHeight - 2
  }

  const scrollToBottom = () => {
    if (!feedRef) return
    // Clamp inside scrollbox; large value is fine.
    feedRef.scrollTop = Number.MAX_SAFE_INTEGER
  }

  const scrollByRows = (rows: number) => {
    if (!feedRef) return
    feedRef.scrollBy({ x: 0, y: rows })
  }

  const pageSize = () => {
    if (!feedRef) return 10
    return Math.max(3, feedRef.height - 2)
  }

  // Auto-follow new content while user is at the bottom.
  // We intentionally do NOT depend on streamingText() here to avoid
  // forcing scroll work on every streamed token.
  createEffect(() => {
    if (props.isWelcome()) return
    session().messages.length
    props.agentState()
    if (!autoFollow()) return
    queueMicrotask(() => {
      if (!autoFollow()) return
      scrollToBottom()
    })
  })

  useKeyboard((key) => {
    if (!props.scrollShortcutsEnabled()) return
    if (props.isWelcome()) return
    if (!feedRef) return

    if (key.name === "pageup") {
      setAutoFollow(false)
      scrollByRows(-pageSize())
      return
    }

    if (key.name === "pagedown") {
      scrollByRows(pageSize())
      if (isNearBottom()) setAutoFollow(true)
      return
    }

    if (key.name === "home") {
      setAutoFollow(false)
      if (feedRef) feedRef.scrollTop = 0
      return
    }

    if (key.name === "end") {
      setAutoFollow(true)
      scrollToBottom()
    }
  })

  const stateLabel = (): string => {
    switch (props.agentState()) {
      case "thinking":
        return "Thinking..."
      case "streaming":
        return "Writing..."
      case "tool_calling":
        return "Executing tool..."
      case "waiting_permission":
        return "Waiting for permission..."
      default:
        return ""
    }
  }

  return (
    <>
      <Show when={props.isWelcome()}>
        <box flexDirection="column" flexGrow={1}>
          {/* Centering container */}
          <box
            flexDirection="column"
            alignItems="center"
            justifyContent="center"
            flexGrow={1}
          >
            <box flexDirection="column" alignItems="center" width={isCompact() ? "90%" : isWide() ? "50%" : "65%"}>
              {/* Logo */}
              {YUE_LOGO.map((line, i) => (
                <text fg={grad()[i] ?? theme.accent}>{line}</text>
              ))}

              {/* Input with border */}
              <box width="100%" paddingTop={2} flexDirection="column" gap={1} zIndex={10}>
                 <ChatInput
                   value={props.inputValue}
                   onInput={props.onInput}
                   onSubmit={props.onSubmit}
                   mode={props.mode()}
                   modelName={props.modelName()}
                   focused={props.inputFocused()}
                   commandPreview={
                     <CommandPreview
                       open={props.commandPreviewOpen}
                       commands={props.commandSuggestions}
                       selectedIndex={props.commandIndex}
                     />
                   }
                 />
               </box>

              {/* Hints - hidden in compact mode */}
              <Show when={!isCompact()}>
                <box flexDirection="row" marginTop={1}>
                  <text fg={theme.secondary}>Enter</text>
                  <text fg={theme.muted}> send</text>
                  <text fg={theme.border}>{"  "}{DOT}{"  "}</text>
                  <text fg={theme.secondary}>Ctrl+C</text>
                  <text fg={theme.muted}> exit</text>
                </box>
              </Show>

              {/* Tagline */}
              <box marginTop={1}>
                <text fg={theme.muted}>a quiet light in your terminal</text>
              </box>
            </box>
          </box>

          {/* Footer bar */}
          <box
            flexDirection="row"
            justifyContent="space-between"
            width="100%"
            paddingLeft={2}
            paddingRight={2}
            height={1}
          >
            <text fg={theme.muted}>{shortCwd()}</text>
            <text fg={theme.muted}>v{pkg.version}</text>
          </box>
        </box>
      </Show>

      <Show when={!props.isWelcome()}>
        <scrollbox
          id="chat-feed"
          flexDirection="column"
          flexGrow={1}
          stickyScroll={true}
          stickyStart="bottom"
          viewportCulling={true}
          scrollbarOptions={{ visible: false }}
          ref={(el) => {
            feedRef = el
          }}
          onMouseScroll={(event) => {
            const info = event.scroll
            if (!info) return
            if (info.direction !== "up" && info.direction !== "down") return
            setAutoFollow(false)
            const delta = info.direction === "up" ? -info.delta : info.delta
            scrollByRows(delta)
            if (isNearBottom()) setAutoFollow(true)
          }}
        >
          <For each={session().messages}>
            {(msg) => <ChatMessage message={msg} />}
          </For>



          <Show when={props.agentState() !== "idle"}>
            <box id="chat-spinner">
              <Spinner label={stateLabel()} />
            </box>
          </Show>
        </scrollbox>
      </Show>
    </>
  )
}
