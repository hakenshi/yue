import { z } from "zod"

export const personalitySchema = z.object({
  name: z.string(),
  description: z.string(),
  sociability: z.number().min(1).max(10),
  verbosity: z.number().min(1).max(10),
  enthusiasm: z.number().min(1).max(10),
  directness: z.number().min(1).max(10),
  traits: z.string(),
  systemPromptAddition: z.string().optional(),
})

export type Personality = z.infer<typeof personalitySchema>
