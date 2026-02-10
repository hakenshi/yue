import { useApp } from "../hooks/useApp.ts"
import { shortCwd } from "../../utils/path.ts"

const ICON_MOON = "\uF186"
const ICON_FOLDER = "\uF07B"
const ICON_TOKENS = "\uF2DB"
const SEP = " \u2502 "

function formatTokens(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`
  return `${n}`
}

export function StatusBar() {
  const { session, config, theme } = useApp()

  const modelShort = () => {
    const m = config.model
    if (m.length <= 24) return m
    return m.slice(0, 24) + "\u2026"
  }

  return (
    <box
      flexDirection="row"
      justifyContent="space-between"
      alignItems="center"
      backgroundColor={theme.surface}
      paddingLeft={1}
      paddingRight={1}
      paddingTop={1}
      paddingBottom={1}
      width="100%"
    >
      <box flexDirection="row">
        <text fg={theme.accent}>
          <strong>{ICON_MOON} Yue</strong>
        </text>
        <text fg={theme.border}>{SEP}</text>
        <text fg={theme.muted}>
          {ICON_FOLDER} {shortCwd()}
        </text>
      </box>
      <box flexDirection="row">
        <text fg={theme.muted}>{config.provider}:{modelShort()}</text>
        <text fg={theme.border}>{SEP}</text>
        <text fg={theme.muted}>
          {ICON_TOKENS} {formatTokens(session().totalTokens)}
        </text>
      </box>
    </box>
  )
}
