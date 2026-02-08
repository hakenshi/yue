import type { Tool } from "./types.ts"
import { existsSync } from "fs"

export const readTool: Tool = {
  definition: {
    name: "read",
    description: "Read the contents of a file at the given absolute path",
    parameters: [
      { name: "path", type: "string", description: "Absolute path to the file", required: true },
    ],
    requiresPermission: false,
  },
  async execute(args) {
    const path = args.path as string
    try {
      if (!existsSync(path)) {
        return { success: false, output: "", error: `File not found: ${path}` }
      }
      const file = Bun.file(path)
      const content = await file.text()
      return { success: true, output: content }
    } catch (error) {
      return {
        success: false,
        output: "",
        error: error instanceof Error ? error.message : String(error),
      }
    }
  },
}
