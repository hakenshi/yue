import { z } from "zod"
import { messageSchema } from "../llm/types.ts"

export const sessionSchema = z.object({
  id: z.string(),
  title: z.string().default("New Session"),
  messages: z.array(messageSchema).default([]),
  createdAt: z.number(),
  updatedAt: z.number(),
  totalTokens: z.number().default(0),
})

export type Session = z.infer<typeof sessionSchema>
