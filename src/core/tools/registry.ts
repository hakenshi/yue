import type { Tool } from "../../types/tools"
import { tool, jsonSchema } from "ai"

export class ToolRegistry {
  private tools = new Map<string, Tool>()

  register(t: Tool) {
    this.tools.set(t.definition.name, t)
  }

  get(name: string): Tool | undefined {
    return this.tools.get(name)
  }

  getAll(): Tool[] {
    return Array.from(this.tools.values())
  }

  toAISDKTools(): Record<string, unknown> {
    const result: Record<string, unknown> = {}
    for (const t of this.tools.values()) {
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
}
