import { useApp } from "../hooks/useApp.ts"
import type { TextareaRenderable } from "@opentui/core"
import type { KeyEvent } from "@opentui/core"
import { createEffect } from "solid-js"

export interface BaseInputProps {
  value: () => string
  onInput: (v: string) => void
  onSubmit: () => void
  placeholder?: string
  focused?: boolean
  borderColor?: string
  focusedBorderColor?: string
  minHeight?: number
  maxHeight?: number
  onKeyDown?: (event: KeyEvent) => void
  onKeyPress?: (event: KeyEvent) => void
  children?: any
}

export function BaseInput(props: BaseInputProps) {
  const { theme } = useApp()
  let textareaRef: TextareaRenderable | undefined

  // Sync parent value -> textarea buffer (needed for programmatic updates like autocomplete).
  createEffect(() => {
    const val = props.value()
    if (!textareaRef) return

    if (textareaRef.plainText !== val) {
      textareaRef.setText(val)
      textareaRef.cursorOffset = val.length
    }
  })

  const handleSubmit = () => {
    const text = props.value().trim()
    if (text.length > 0) {
      props.onSubmit()
    }
  }

  return (
    <box
      flexDirection="column"
      position="relative"
      overflow="visible"
      border={true}
      borderStyle="rounded"
      borderColor={props.borderColor ?? theme.border}
      focusedBorderColor={props.focusedBorderColor ?? theme.accentDim}
      focused={props.focused}
      minHeight={props.minHeight ?? 3}
      maxHeight={props.maxHeight ?? 10}
      padding={1}
      backgroundColor={theme.surface}
    >
      <box flexDirection="row" flexGrow={1} width="100%" paddingLeft={1} paddingRight={1}>
        <box flexGrow={1}>
          <textarea
            ref={textareaRef}
            onContentChange={() => {
              if (textareaRef) {
                props.onInput(textareaRef.plainText)
              }
            }}
            onSubmit={handleSubmit}
            onKeyDown={props.onKeyDown}
            onKeyPress={props.onKeyPress}
            keyBindings={[
              { name: "return", action: "submit" },
              { name: "return", shift: true, action: "newline" },
              { name: "enter", action: "submit" },
              { name: "enter", shift: true, action: "newline" },
              { name: "linefeed", action: "submit" },
              { name: "linefeed", shift: true, action: "newline" },
            ]}
            placeholder={props.placeholder ?? "Message Yue..."}
            focused={props.focused}
            flexGrow={1}
            wrapMode="word"
            backgroundColor={theme.surface}
            textColor={theme.fg}
            placeholderColor={theme.muted}
          />
        </box>
      </box>
      {props.children}
    </box>
  )
}
