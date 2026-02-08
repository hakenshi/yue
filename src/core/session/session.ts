import { generateId } from "../../utils/id.ts"
import type { Message } from "../llm/types.ts"
import type { Session } from "./types.ts"
import * as store from "./store.ts"

export function newSession(title?: string): Session {
  const session: Session = {
    id: generateId(),
    title: title ?? "New Session",
    messages: [],
    createdAt: Date.now(),
    updatedAt: Date.now(),
    totalTokens: 0,
  }
  store.createSession(session)
  return session
}

export function loadSession(id: string): Session | null {
  return store.getSession(id)
}

export function listAllSessions() {
  return store.listSessions()
}

export function pushMessage(session: Session, message: Message): Session {
  store.addMessage(session.id, message)
  return {
    ...session,
    messages: [...session.messages, message],
    updatedAt: Date.now(),
    totalTokens: session.totalTokens + (message.usage?.inputTokens ?? 0) + (message.usage?.outputTokens ?? 0),
  }
}

export function renameSession(session: Session, title: string): Session {
  store.updateSessionTitle(session.id, title)
  return { ...session, title, updatedAt: Date.now() }
}
