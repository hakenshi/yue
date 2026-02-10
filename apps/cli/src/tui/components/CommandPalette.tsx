import { For, Show, createEffect, createMemo, createSignal } from "solid-js"
import { useKeyboard } from "@opentui/solid"
import type { ScrollBoxRenderable } from "@opentui/core"
import { RGBA } from "@opentui/core"
import type { Command } from "../../types/commands"
import { useApp } from "../hooks/useApp.ts"
import { useViewport } from "../hooks/useViewport.ts"
import { BaseInput } from "./BaseInput.tsx"

function normalize(s: string): string {
  return s.toLowerCase()
}

function scoreCommand(cmd: Command, query: string): number {
  const q = normalize(query)
  if (!q) return 0
  const name = normalize(cmd.name)
  const usage = normalize(cmd.usage)
  const desc = normalize(cmd.description)
  const aliases = cmd.aliases?.map(normalize) ?? []

  if (name === q) return 100
  if (aliases.includes(q)) return 95
  if (name.startsWith(q)) return 90
  if (aliases.some((a) => a.startsWith(q))) return 85
  if (usage.includes(q)) return 60
  if (desc.includes(q)) return 40
  return 0
}

export function CommandPalette(props: {
  open: () => boolean
  commands: () => Command[]
  onClose: () => void
  onSelect: (cmd: Command) => void
}) {
  const { theme } = useApp()
  const viewport = useViewport()
  const [query, setQuery] = createSignal("")
  const [selected, setSelected] = createSignal(0)
  let scrollRef: ScrollBoxRenderable | undefined

  const filtered = createMemo(() => {
    const q = query().trim()
    const all = props.commands()
    if (!q) return all

    const scored = all
      .map((cmd) => ({ cmd, score: scoreCommand(cmd, q) }))
      .filter((x) => x.score > 0)
      .sort((a, b) => b.score - a.score || a.cmd.name.localeCompare(b.cmd.name))

    return scored.map((x) => x.cmd)
  })

  const listHeight = () => Math.max(6, Math.min(18, viewport().safeHeight - 10))

  createEffect(() => {
    if (!props.open()) return
    setQuery("")
    setSelected(0)
  })

  createEffect(() => {
    const list = filtered()
    if (list.length === 0) {
      if (selected() !== 0) setSelected(0)
      return
    }
    if (selected() > list.length - 1) setSelected(list.length - 1)
  })

  createEffect(() => {
    if (!props.open()) return
    const list = filtered()
    if (!scrollRef) return
    if (list.length === 0) return
    const target = Math.max(0, selected() - Math.floor(listHeight() / 2))
    scrollRef.scrollTop = target
  })

  useKeyboard((key) => {
    if (!props.open()) return

    if (key.name === "escape") {
      props.onClose()
      return
    }

    const list = filtered()
    if (list.length === 0) return

    if (key.name === "up") {
      setSelected((i) => Math.max(0, i - 1))
      return
    }

    if (key.name === "down") {
      setSelected((i) => Math.min(list.length - 1, i + 1))
      return
    }

    if (key.name === "return") {
      const chosen = list[Math.min(selected(), list.length - 1)]
      if (!chosen) return
      props.onSelect(chosen)
      props.onClose()
    }
  })

  const panelWidth = () => {
    const w = viewport().width
    if (w < 80) return "95%"
    if (w < 140) return "70%"
    return "55%"
  }

  const overlayBg = () => {
    const bg = theme.bg
    if (typeof bg === "string") return bg
    return RGBA.fromValues(bg.r, bg.g, bg.b, 1)
  }

  return (
    <Show when={props.open()}>
      <box
        position="absolute"
        left={0}
        right={0}
        top={0}
        bottom={0}
        zIndex={200}
        shouldFill={false}
        paddingLeft={2}
        paddingRight={2}
        paddingTop={1}
        paddingBottom={1}
        justifyContent="center"
        alignItems="center"
      >
        <box
          position="absolute"
          left={0}
          right={0}
          top={0}
          bottom={0}
          backgroundColor={overlayBg()}
          opacity={0.75}
          zIndex={200}
        />

        <box
          flexDirection="column"
          width={panelWidth()}
          border={true}
          borderStyle="rounded"
          borderColor={theme.border}
          backgroundColor={theme.surface}
          paddingLeft={2}
          paddingRight={2}
          paddingTop={1}
          paddingBottom={1}
          zIndex={201}
        >
          <box flexDirection="row" justifyContent="space-between">
            <text fg={theme.fg}>
              <strong>Command Palette</strong>
            </text>
            <text fg={theme.muted}>Enter select · Esc</text>
          </box>

          <box paddingTop={1} />

          <BaseInput
            value={query}
            onInput={setQuery}
            onSubmit={() => {
              const list = filtered()
              const chosen = list[Math.min(selected(), list.length - 1)]
              if (!chosen) return
              props.onSelect(chosen)
              props.onClose()
            }}
            focused={true}
            minHeight={3}
            maxHeight={3}
            placeholder="Type a command…"
          />

          <box paddingTop={1} />

          <scrollbox
            flexDirection="column"
            flexGrow={1}
            maxHeight={listHeight()}
            border={true}
            borderStyle="rounded"
            borderColor={theme.border}
            backgroundColor={theme.surface}
            paddingLeft={1}
            paddingRight={1}
            paddingTop={1}
            paddingBottom={1}
            scrollbarOptions={{ visible: false }}
            focused={true}
            ref={scrollRef}
          >
            <Show when={filtered().length === 0}>
              <text fg={theme.muted}>(no matches)</text>
            </Show>

            <For each={filtered()}>
              {(cmd, i) => {
                const isSel = () => i() === selected()
                const aliasStr = cmd.aliases?.length
                  ? ` (${cmd.aliases.map((a) => `/${a}`).join(", ")})`
                  : ""
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
          </scrollbox>
        </box>
      </box>
    </Show>
  )
}
