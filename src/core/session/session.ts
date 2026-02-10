import { generateId } from "../../utils/id.ts"
import type { Message } from "../../types/llm"
import type { Session } from "../../types/session"
import * as store from "./store.ts"

export class SessionManager {
  create(title?: string): Session {
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

  load(id: string): Session | null {
    return store.getSession(id)
  }

  list() {
    return store.listSessions()
  }

  pushMessage(session: Session, message: Message): Session {
    store.addMessage(session.id, message)
    return {
      ...session,
      messages: [...session.messages, message],
      updatedAt: Date.now(),
      totalTokens: session.totalTokens + (message.usage?.inputTokens ?? 0) + (message.usage?.outputTokens ?? 0),
    }
  }

  rename(session: Session, title: string): Session {
    store.updateSessionTitle(session.id, title)
    return { ...session, title, updatedAt: Date.now() }
  }

  updateMessage(session: Session, messageId: string, updater: (msg: Message) => Message): Session {
    const messages = session.messages.map((msg) =>
      msg.id === messageId ? updater(msg) : msg
    )
    return { ...session, messages, updatedAt: Date.now() }
  }
}
