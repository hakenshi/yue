import type { Tool } from "./types.ts"
import { tool, jsonSchema } from "ai"

const tools = new Map<string, Tool>()

export function registerTool(t: Tool) {
  tools.set(t.definition.name, t)
}

export function getTool(name: string): Tool | undefined {
  return tools.get(name)
}

export function getAllTools(): Tool[] {
  return Array.from(tools.values())
}

export function toAISDKTools(): Record<string, unknown> {
  const result: Record<string, unknown> = {}
  for (const t of tools.values()) {
    const properties: Record<string, unknown> = {}
    const required: string[] = []

    for (const p of t.definition.parameters) {
      const prop: Record<string, unknown> = { description: p.description }
      switch (p.type) {
        case "string":
          prop.type = "string"
          break
        case "number":
          prop.type = "number"
          break
        case "boolean":
          prop.type = "boolean"
          break
      }
      properties[p.name] = prop
      if (p.required) required.push(p.name)
    }

    const def = t
    result[t.definition.name] = tool({
      description: t.definition.description,
      inputSchema: jsonSchema({
        type: "object",
        properties,
        required,
      }),
      execute: async (args: Record<string, unknown>) => {
        const res = await def.execute(args)
        return res.output || res.error || ""
      },
    } as any)
  }
  return result
}
