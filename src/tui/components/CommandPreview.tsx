import { For, Show } from "solid-js"
import type { Command } from "../../types/commands"
import { useApp } from "../hooks/useApp.ts"

export function CommandPreview(props: {
  open: () => boolean
  commands: () => Command[]
  selectedIndex: () => number
}) {
  const { theme } = useApp()

  return (
    <Show when={props.open() && props.commands().length > 0}>
      <box
        flexDirection="column"
        border={true}
        borderStyle="rounded"
        borderColor={theme.border}
        backgroundColor={theme.surface}
        paddingLeft={1}
        paddingRight={1}
        paddingTop={0}
        paddingBottom={0}
        overflow="hidden"
      >
        <box flexDirection="row" justifyContent="space-between">
          <text fg={theme.muted}>
            <strong>Commands</strong>
          </text>
          <text fg={theme.muted}>Tab autocomplete · Up/Down select</text>
        </box>
        <For each={props.commands()}>
          {(cmd, i) => {
            const isSel = () => i() === props.selectedIndex()
            const aliasStr = cmd.aliases?.length ? ` (${cmd.aliases.map((a) => `/${a}`).join(", ")})` : ""
            return (
              <box
                flexDirection="row"
                justifyContent="space-between"
                backgroundColor={isSel() ? theme.selectedBg : theme.surface}
                height={1}
              >
                <text fg={isSel() ? theme.fg : theme.muted}>
                  <strong>{cmd.usage}</strong>{aliasStr}
                </text>
                <text fg={isSel() ? theme.fg : theme.muted}>{cmd.description}</text>
              </box>
            )
          }}
        </For>
      </box>
    </Show>
  )
}
