import { useApp } from "../hooks/useApp.ts"
import { useKeyboard } from "@opentui/solid"

const ICON_SHIELD = "\uF132"

export function PermissionPrompt(props: {
  toolName: string
  args: Record<string, unknown>
  onResolve: (approved: boolean) => void
}) {
  const { theme } = useApp()

  useKeyboard((key) => {
    if (key.name === "y") props.onResolve(true)
    else if (key.name === "n" || key.name === "escape") props.onResolve(false)
  })

  const summary = () => {
    const a = props.args
    if (props.toolName === "bash") return `$ ${a.command}`
    if (props.toolName === "write") return `Write to ${a.path}`
    if (props.toolName === "edit") return `Edit ${a.path}`
    return JSON.stringify(a).slice(0, 80)
  }

  return (
    <box
      flexDirection="column"
      border={true}
      borderStyle="rounded"
      borderColor={theme.warning}
      focusedBorderColor={theme.accent}
      focused={true}
      backgroundColor={theme.surface}
      padding={1}
      marginLeft={2}
      marginRight={2}
      marginBottom={1}
    >
      <box flexDirection="row">
        <text fg={theme.warning}>
          <strong>{ICON_SHIELD} </strong>
        </text>
        <text fg={theme.fg}>
          <strong>Permission Required</strong>
        </text>
      </box>
      <text> </text>
      <box flexDirection="row" paddingLeft={2}>
        <text fg={theme.muted}>Tool: </text>
        <text fg={theme.accent}>
          <strong>{props.toolName}</strong>
        </text>
      </box>
      <box paddingLeft={2}>
        <text fg={theme.muted}>{summary()}</text>
      </box>
      <text> </text>
      <box flexDirection="row" paddingLeft={2} gap={4}>
        <box flexDirection="row">
          <text fg={theme.border}>[</text>
          <text fg={theme.success}>y</text>
          <text fg={theme.border}>]</text>
          <text fg={theme.muted}> allow</text>
        </box>
        <box flexDirection="row">
          <text fg={theme.border}>[</text>
          <text fg={theme.error}>n</text>
          <text fg={theme.border}>]</text>
          <text fg={theme.muted}> deny</text>
        </box>
      </box>
    </box>
  )
}
