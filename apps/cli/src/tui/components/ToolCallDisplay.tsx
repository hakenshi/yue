import { useApp } from "../hooks/useApp.ts"

const TOOL_ICONS: Record<string, string> = {
  bash: "\uEA85",
  read: "\uEA7B",
  write: "\uEA7C",
  edit: "\uEB04",
  glob: "\uEA82",
  grep: "\uEA7D",
}
const ICON_DEFAULT = "\uF013"

export function ToolCallDisplay(props: { name: string; input: Record<string, unknown> }) {
  const { theme } = useApp()

  const icon = () => TOOL_ICONS[props.name] ?? ICON_DEFAULT

  const summary = () => {
    const a = props.input
    switch (props.name) {
      case "bash":
        return `${a.command}`
      case "read":
        return `${a.path}`
      case "write":
        return `${a.path}`
      case "edit":
        return `${a.path}`
      case "glob":
        return `${a.pattern}`
      case "grep":
        return `/${a.pattern}/`
      default:
        return JSON.stringify(a).slice(0, 60)
    }
  }

  return (
    <box paddingLeft={3} paddingTop={0} flexDirection="row">
      <text fg={theme.accentDim}>{icon()} </text>
      <text fg={theme.border}>{props.name}</text>
      <text fg={theme.border}>{" \u203A "}</text>
      <text fg={theme.muted}>{summary()}</text>
    </box>
  )
}
