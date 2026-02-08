import { useApp } from "../hooks/useApp.ts"

const DOT = "\u00B7"

export function HintBar() {
  const { theme } = useApp()

  return (
    <box
      flexDirection="row"
      justifyContent="center"
      height={1}
      width="100%"
    >
      <text fg={theme.border}>Enter</text>
      <text fg={theme.muted}> send</text>
      <text fg={theme.border}>{"  "}{DOT}{"  "}</text>
      <text fg={theme.border}>Esc</text>
      <text fg={theme.muted}> clear</text>
      <text fg={theme.border}>{"  "}{DOT}{"  "}</text>
      <text fg={theme.border}>Ctrl+C</text>
      <text fg={theme.muted}> exit</text>
    </box>
  )
}
