import type { Tool } from "../../types/tools"
import { mkdirSync } from "fs"
import { dirname } from "path"

export const writeTool: Tool = {
  definition: {
    name: "write",
    description: "Write content to a file at the given absolute path, creating directories if needed",
    parameters: [
      { name: "path", type: "string", description: "Absolute path to the file", required: true },
      { name: "content", type: "string", description: "Content to write", required: true },
    ],
    requiresPermission: true,
  },
  async execute(args) {
    const path = args.path as string
    const content = args.content as string
    try {
      mkdirSync(dirname(path), { recursive: true })
      await Bun.write(path, content)
      return { success: true, output: `Written to ${path}` }
    } catch (error) {
      return {
        success: false,
        output: "",
        error: error instanceof Error ? error.message : String(error),
      }
    }
  },
}
