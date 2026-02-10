import { Show, type JSX } from "solid-js"
import { BaseInput } from "./BaseInput.tsx"
import { useApp } from "../hooks/useApp.ts"

export type ChatMode = "plan" | "build"

interface ChatInputProps {
  value: () => string
  onInput: (v: string) => void
  onSubmit: () => void
  mode: ChatMode
  modelName: string
  focused?: boolean
  placeholder?: string
  commandPreview?: JSX.Element
}

export function ChatInput(props: ChatInputProps) {
  const { theme } = useApp()

  const COMMAND_PREVIEW_GAP = 1
  
  const borderColor = () => (props.mode === "plan" ? (theme.warning as string) : (theme.accent as string))
  const focusedBorderColor = () =>
    props.mode === "plan" ? (theme.warning as string) : (theme.accentDim as string)
  const modeColor = () => borderColor()

  return (
    <BaseInput
      value={props.value}
      onInput={props.onInput}
      onSubmit={props.onSubmit}
      placeholder={props.placeholder}
      focused={props.focused}
      borderColor={borderColor()}
      focusedBorderColor={focusedBorderColor()}
      minHeight={4}
      maxHeight={8}
    >
      <Show when={props.commandPreview}>
        <box
          position="absolute"
          left={0}
          right={0}
          bottom="100%"
          marginBottom={COMMAND_PREVIEW_GAP}
          zIndex={50}
          shouldFill={false}
        >
          {props.commandPreview}
        </box>
      </Show>

      <box flexDirection="row" marginTop={1} gap={1}>
        <text fg={modeColor()}>
          <strong>{props.mode}</strong>
        </text>
        <text fg={theme.fg}>{props.modelName}</text>
      </box>
    </BaseInput>
  )
}
