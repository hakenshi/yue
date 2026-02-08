import { For, Show } from "solid-js"
import { useApp } from "../hooks/useApp.ts"
import { ChatMessage } from "./ChatMessage.tsx"
import { Spinner } from "./Spinner.tsx"
import type { AgentState } from "../../core/agent/types.ts"
import pkg from "../../../package.json"

const ICON_YUE = "\uF186"
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

const ICON_PROMPT = "\uF105" // nf-fa-angle_right

function shortCwd(): string {
  const cwd = process.cwd()
  const home = process.env.HOME ?? ""
  if (home && cwd.startsWith(home)) {
    return "~" + cwd.slice(home.length)
  }
  return cwd
}

export function ChatView(props: {
  streamingText: () => string
  agentState: () => AgentState
  inputValue: () => string
  onInput: (v: string) => void
  inputFocused: boolean
  isWelcome: boolean
}) {
  const { session, theme } = useApp()

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
      <Show when={props.isWelcome}>
        <box flexDirection="column" flexGrow={1}>
          {/* Centering container */}
          <box
            flexDirection="column"
            alignItems="center"
            justifyContent="center"
            flexGrow={1}
          >
            <box flexDirection="column" alignItems="center" width="60%">
              {/* Logo */}
              {YUE_LOGO.map((line) => (
                <text fg={theme.accent}>{line}</text>
              ))}

              {/* Textarea with border */}
              <box
                flexDirection="row"
                width="100%"
                paddingTop={2}
              >
                <box
                  flexDirection="row"
                  alignItems="flex-start"
                  flexGrow={1}
                  border={true}
                  borderStyle="rounded"
                  borderColor={theme.border}
                  focusedBorderColor={theme.accentDim}
                  focused={props.inputFocused}
                  paddingLeft={1}
                  paddingRight={1}
                >
                  <text fg={props.inputFocused ? theme.accent : theme.muted}>{ICON_PROMPT} </text>
                  <textarea
                    value={props.inputValue()}
                    onInput={props.onInput}
                    placeholder="Message Yue..."
                    focused={props.inputFocused}
                    flexGrow={1}
                    height={5}
                    wrapText
                    backgroundColor={theme.bg}
                    textColor={theme.fg}
                    placeholderColor={theme.muted}
                  />
                </box>
              </box>

              {/* Hints */}
              <box flexDirection="row" marginTop={1}>
                <text fg={theme.secondary}>Enter</text>
                <text fg={theme.muted}> send</text>
                <text fg={theme.border}>{"  "}{DOT}{"  "}</text>
                <text fg={theme.secondary}>Ctrl+C</text>
                <text fg={theme.muted}> exit</text>
              </box>

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

      <Show when={!props.isWelcome}>
        <scrollbox flexGrow={1} focused={false}>
          <box flexDirection="column" paddingTop={1}>
            <For each={session().messages}>
              {(msg) => <ChatMessage message={msg} />}
            </For>

            <Show when={props.streamingText()}>
              <box
                flexDirection="column"
                paddingLeft={2}
                paddingRight={2}
                paddingTop={1}
                paddingBottom={1}
                marginLeft={1}
                marginRight={1}
                marginBottom={1}
                backgroundColor={theme.surface}
              >
                <text fg={theme.accent}>
                  <strong>{ICON_YUE} Yue</strong>
                </text>
                <box paddingLeft={3} paddingTop={1}>
                  <text selectable>{props.streamingText()}</text>
                </box>
              </box>
            </Show>

            <Show when={props.agentState() !== "idle"}>
              <Spinner label={stateLabel()} />
            </Show>
          </box>
        </scrollbox>
      </Show>
    </>
  )
}
