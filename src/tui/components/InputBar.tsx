import { useApp } from "../hooks/useApp.ts"

const ICON_PROMPT = "\uF105" // nf-fa-angle_right
const DOT = "\u00B7"

export function InputBar(props: {
  value: () => string
  onInput: (v: string) => void
  onSubmit: () => void
  focused: boolean
}) {
  const { theme } = useApp()

  return (
    <box flexDirection="column" backgroundColor={theme.surface}>
      <box
        paddingLeft={2}
        paddingRight={2}
        paddingTop={1}
        flexDirection="row"
      >
        <text fg={props.focused ? theme.accent : theme.muted}>{ICON_PROMPT} </text>
        <textarea
          value={props.value()}
          onInput={props.onInput}
          placeholder="Message Yue..."
          focused={props.focused}
          flexGrow={1}
          height={4}
          wrapText
          backgroundColor={theme.surface}
          textColor={theme.fg}
          placeholderColor={theme.muted}
        />
      </box>
      <box
        flexDirection="row"
        justifyContent="center"
        paddingTop={0}
        paddingBottom={0}
        height={1}
      >
        <text fg={theme.border}>Enter</text>
        <text fg={theme.muted}> send</text>
        <text fg={theme.border}>{"  "}{DOT}{"  "}</text>
        <text fg={theme.border}>Ctrl+C</text>
        <text fg={theme.muted}> exit</text>
      </box>
    </box>
  )
}
