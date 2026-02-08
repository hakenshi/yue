import { Database } from "bun:sqlite"
import { join } from "path"
import { mkdirSync } from "fs"
import type { Session } from "./types.ts"
import type { Message } from "../llm/types.ts"
import { createLogger } from "../../utils/logger.ts"

const log = createLogger("session-store")

let db: Database | null = null

function getDb(): Database {
  if (!db) {
    const dbPath = join(
      process.env.XDG_DATA_HOME || join(process.env.HOME || "~", ".local", "share"),
      "yue",
      "sessions.db",
    )
    mkdirSync(join(dbPath, ".."), { recursive: true })

    db = new Database(dbPath)
    db.run("PRAGMA journal_mode=WAL")
    db.run(`
      CREATE TABLE IF NOT EXISTS sessions (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        created_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL,
        total_tokens INTEGER DEFAULT 0
      )
    `)
    db.run(`
      CREATE TABLE IF NOT EXISTS messages (
        id TEXT PRIMARY KEY,
        session_id TEXT NOT NULL,
        role TEXT NOT NULL,
        content TEXT NOT NULL,
        tool_calls TEXT,
        tool_results TEXT,
        usage TEXT,
        created_at INTEGER NOT NULL,
        FOREIGN KEY (session_id) REFERENCES sessions(id)
      )
    `)
    log.info("Database initialized")
  }
  return db
}

export function createSession(session: Session): void {
  const d = getDb()
  d.run(
    "INSERT INTO sessions (id, title, created_at, updated_at, total_tokens) VALUES (?, ?, ?, ?, ?)",
    [session.id, session.title, session.createdAt, session.updatedAt, session.totalTokens],
  )
}

export function getSession(id: string): Session | null {
  const d = getDb()
  const row = d.query("SELECT * FROM sessions WHERE id = ?").get(id) as Record<string, unknown> | null
  if (!row) return null

  const msgRows = d.query("SELECT * FROM messages WHERE session_id = ? ORDER BY created_at ASC").all(id) as Record<string, unknown>[]

  const messages: Message[] = msgRows.map((m) => ({
    id: m.id as string,
    role: m.role as Message["role"],
    content: m.content as string,
    toolCalls: m.tool_calls ? JSON.parse(m.tool_calls as string) : undefined,
    toolResults: m.tool_results ? JSON.parse(m.tool_results as string) : undefined,
    usage: m.usage ? JSON.parse(m.usage as string) : undefined,
    createdAt: m.created_at as number,
  }))

  return {
    id: row.id as string,
    title: row.title as string,
    messages,
    createdAt: row.created_at as number,
    updatedAt: row.updated_at as number,
    totalTokens: row.total_tokens as number,
  }
}

export function listSessions(): Omit<Session, "messages">[] {
  const d = getDb()
  const rows = d.query("SELECT * FROM sessions ORDER BY updated_at DESC").all() as Record<string, unknown>[]
  return rows.map((r) => ({
    id: r.id as string,
    title: r.title as string,
    messages: [],
    createdAt: r.created_at as number,
    updatedAt: r.updated_at as number,
    totalTokens: r.total_tokens as number,
  }))
}

export function addMessage(sessionId: string, message: Message): void {
  const d = getDb()
  d.run(
    "INSERT INTO messages (id, session_id, role, content, tool_calls, tool_results, usage, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
    [
      message.id,
      sessionId,
      message.role,
      message.content,
      message.toolCalls ? JSON.stringify(message.toolCalls) : null,
      message.toolResults ? JSON.stringify(message.toolResults) : null,
      message.usage ? JSON.stringify(message.usage) : null,
      message.createdAt,
    ],
  )
  d.run("UPDATE sessions SET updated_at = ?, total_tokens = total_tokens + ? WHERE id = ?", [
    Date.now(),
    (message.usage?.inputTokens ?? 0) + (message.usage?.outputTokens ?? 0),
    sessionId,
  ])
}

export function updateSessionTitle(id: string, title: string): void {
  const d = getDb()
  d.run("UPDATE sessions SET title = ?, updated_at = ? WHERE id = ?", [title, Date.now(), id])
}

export function closeDb(): void {
  if (db) {
    db.close()
    db = null
  }
}
