import type { Message } from "./llm"

export interface Session {
  id: string
  title: string
  messages: Message[]
  createdAt: number
  updatedAt: number
  totalTokens: number
}
