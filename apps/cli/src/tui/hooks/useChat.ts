import { createEffect, createMemo, createSignal } from "solid-js"
import { useRenderer } from "@opentui/solid"
import type { Message } from "../../types/llm"
import type { AgentState } from "../../types/agent"
import { useApp } from "./useApp.ts"
import { generateId } from "../../utils/id.ts"
import { isCommand, executeCommand } from "../../core/commands/index.ts"
import type { Command } from "../../types/commands"

export type ChatMode = "plan" | "build"

function stripSystemReminders(text: string): string {
  return text.replace(/<system-reminder>[\s\S]*?<\/system-reminder>/g, "")
}

function mergeStreamText(prev: string, chunk: string): string {
  if (!chunk) return prev
  if (!prev) return chunk
  if (chunk === prev) return prev

  // Provider emitted full text so far.
  if (chunk.startsWith(prev)) return chunk

  // Provider repeated an earlier (shorter) prefix.
  if (prev.startsWith(chunk)) return prev

  // Provider repeated the same suffix.
  if (prev.endsWith(chunk)) return prev

  // If the provider sends whitespace + already-seen text, keep only the whitespace.
  const leading = chunk.match(/^\s+/)?.[0] ?? ""
  if (leading) {
    const rest = chunk.slice(leading.length)
    if (rest === prev) return prev + leading
    if (rest.startsWith(prev)) return prev + leading + rest.slice(prev.length)
    if (prev.endsWith(rest)) return prev + leading
  }

  // Merge overlapping suffix/prefix to avoid duplication.
  const max = Math.min(prev.length, chunk.length, 4096)
  for (let k = max; k > 0; k--) {
    if (prev.endsWith(chunk.slice(0, k))) {
      return prev + chunk.slice(k)
    }
  }

  return prev + chunk
}

export function useChat() {
  const { agent, config, session, setSession, sessions, commands } = useApp()
  const renderer = useRenderer()
  const [input, setInput] = createSignal("")
  const [streamingText, setStreamingText] = createSignal("")
  const [agentState, setAgentState] = createSignal<AgentState>("idle")
  const [mode, setMode] = createSignal<ChatMode>("build")
  const [helpRequest, setHelpRequest] = createSignal(0)
  const [commandIndex, setCommandIndex] = createSignal(0)
  const [historyIndex, setHistoryIndex] = createSignal<number | null>(null)
  const [historyDraft, setHistoryDraft] = createSignal("")
  const [permissionRequest, setPermissionRequest] = createSignal<{
    toolName: string
    args: Record<string, unknown>
    resolve: (approved: boolean) => void
  } | null>(null)

  // Guards against stale streaming callbacks and accidental double-submit.
  // Each send() increments this; callbacks from older runs are ignored.
  let activeRunId = 0

  const userInputHistory = createMemo(() => {
    // Shell-like history: only what the user typed in this session.
    // Includes commands (/...) and regular prompts.
    return session()
      .messages
      .filter((m) => m.role === "user")
      .map((m) => m.content)
  })

  const resetHistory = () => {
    if (historyIndex() !== null) setHistoryIndex(null)
    if (historyDraft() !== "") setHistoryDraft("")
  }

  const onUserInput = (v: string) => {
    // Any typing exits history navigation.
    resetHistory()
    setInput(v)
  }

  const historyPrev = () => {
    const hist = userInputHistory()
    if (hist.length === 0) return

    const idx = historyIndex()
    if (idx === null) {
      setHistoryDraft(input())
      const next = hist.length - 1
      setHistoryIndex(next)
      setInput(hist[next] ?? "")
      return
    }

    const next = Math.max(0, idx - 1)
    setHistoryIndex(next)
    setInput(hist[next] ?? "")
  }

  const historyNext = () => {
    const hist = userInputHistory()
    const idx = historyIndex()
    if (idx === null) return

    if (idx >= hist.length - 1) {
      // Exit history mode, restore draft
      setHistoryIndex(null)
      setInput(historyDraft())
      setHistoryDraft("")
      return
    }

    const next = idx + 1
    setHistoryIndex(next)
    setInput(hist[next] ?? "")
  }

  const toggleMode = () => {
    setMode((m) => (m === "plan" ? "build" : "plan"))
  }

  const commandQuery = () => {
    const v = input().trimStart()
    if (!v.startsWith("/")) return null
    const after = v.slice(1)
    const spaceIdx = after.search(/\s/)
    if (spaceIdx !== -1) return null
    return after
  }

  const hasCommandPreview = () => commandQuery() !== null

  const commandSuggestions = createMemo((): Command[] => {
    const q = commandQuery()
    if (q === null) return []
    const query = q.toLowerCase()
    const all = commands.getAll().slice().sort((a, b) => a.name.localeCompare(b.name))
    return all
      .filter((cmd) => {
        if (cmd.name.toLowerCase().startsWith(query)) return true
        if (cmd.aliases?.some((a) => a.toLowerCase().startsWith(query))) return true
        return false
      })
      .slice(0, 10)
  })

  createEffect(() => {
    // reset selection when query changes
    commandQuery()
    setCommandIndex(0)
  })

  const selectNextCommand = () => {
    const list = commandSuggestions()
    if (list.length === 0) return
    setCommandIndex((i) => Math.min(list.length - 1, i + 1))
  }

  const selectPrevCommand = () => {
    const list = commandSuggestions()
    if (list.length === 0) return
    setCommandIndex((i) => Math.max(0, i - 1))
  }

  const applySelectedCommand = () => {
    const list = commandSuggestions()
    if (list.length === 0) return false
    const chosen = list[Math.min(commandIndex(), list.length - 1)]
    if (!chosen) return false
    resetHistory()
    setInput(`/${chosen.name} `)
    return true
  }

  async function send() {
    const text = input().trim()
    if (!text || agentState() !== "idle") return

    resetHistory()

    if (isCommand(text)) {
      if (text === "/help") {
        setInput("")
        setHelpRequest((n) => n + 1)
        return
      }

      setInput("")
      const result = await executeCommand(text, {
        session: session(),
        config,
        agent,
        setSession,
        sessions,
        commands,
        exit: () => renderer.destroy(),
      })
      const sysMsg: Message = {
        id: generateId(),
        role: "system",
        content: result.success ? result.message : `Error: ${result.error ?? result.message}`,
        createdAt: Date.now(),
      }
      setSession(sessions.pushMessage(session(), sysMsg))
      return
    }

    setInput("")
    setStreamingText("")

    // Lock immediately so a duplicate submit in the same tick
    // doesn't push the same user message twice.
    setAgentState("thinking")

    const runId = ++activeRunId
    let done = false
    let tempAssistantId: string | null = null

    const userMessage: Message = {
      id: generateId(),
      role: "user",
      content: text,
      createdAt: Date.now(),
    }

    let updated = sessions.pushMessage(session(), userMessage)
    setSession(updated)

    await agent.run(updated.messages, {
      onTextDelta(delta) {
        if (runId !== activeRunId || done) return
        setAgentState("streaming")
        
        // Create or update temporary assistant message
        if (!tempAssistantId) {
          tempAssistantId = generateId()
          const tempMsg: Message = {
            id: tempAssistantId,
            role: "assistant",
            content: stripSystemReminders(delta),
            createdAt: Date.now(),
          }
          updated = sessions.pushMessage(updated, tempMsg)
        } else {
          updated = sessions.updateMessage(updated, tempAssistantId, (msg) => ({
            ...msg,
            content: stripSystemReminders(delta),
          }))
        }
        setSession({ ...updated })
        setStreamingText(delta) // Keep for spinner state tracking
      },
      onToolCall(_name, _args) {
        if (runId !== activeRunId || done) return
        setAgentState("tool_calling")
      },
      onToolResult(_name, _result) {},
      onComplete(assistantMessage) {
        if (runId !== activeRunId || done) return
        done = true
        
        // Replace temp message with final message, or add if no temp
        if (tempAssistantId) {
          updated = sessions.updateMessage(updated, tempAssistantId, () => ({
            ...assistantMessage,
            content: stripSystemReminders(assistantMessage.content ?? ""),
          }))
        } else {
          updated = sessions.pushMessage(updated, {
            ...assistantMessage,
            content: stripSystemReminders(assistantMessage.content ?? ""),
          })
        }
        setSession({ ...updated })
        
        setStreamingText("")
        setAgentState("idle")
        activeRunId++
      },
      onError(error) {
        if (runId !== activeRunId || done) return
        done = true
        
        // Replace temp with error or add error
        if (tempAssistantId) {
          updated = sessions.updateMessage(updated, tempAssistantId, (msg) => ({
            ...msg,
            content: `Error: ${error.message}`,
          }))
        } else {
          updated = sessions.pushMessage(updated, {
            id: generateId(),
            role: "assistant",
            content: `Error: ${error.message}`,
            createdAt: Date.now(),
          })
        }
        setSession({ ...updated })
        
        setStreamingText("")
        setAgentState("idle")
        activeRunId++
      },
      onPermissionRequest(toolName, args) {
        if (runId !== activeRunId || done) return Promise.resolve(false)
        return new Promise<boolean>((resolve) => {
          setPermissionRequest({ toolName, args, resolve })
          setAgentState("waiting_permission")
        })
      },
    })
  }

  return {
    input,
    setInput,
    onUserInput,
    streamingText,
    agentState,
    mode,
    toggleMode,
    hasCommandPreview,
    commandSuggestions,
    commandIndex,
    selectNextCommand,
    selectPrevCommand,
    applySelectedCommand,
    historyPrev,
    historyNext,
    helpRequest,
    permissionRequest,
    setPermissionRequest,
    send,
  }
}
