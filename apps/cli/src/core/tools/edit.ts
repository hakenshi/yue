import type { Tool } from "../../types/tools"
import { existsSync } from "fs"

export const editTool: Tool = {
  definition: {
    name: "edit",
    description: "Search and replace text in a file. The old_string must be unique in the file.",
    parameters: [
      { name: "path", type: "string", description: "Absolute path to the file", required: true },
      { name: "old_string", type: "string", description: "Exact text to find", required: true },
      { name: "new_string", type: "string", description: "Text to replace with", required: true },
    ],
    requiresPermission: true,
  },
  async execute(args) {
    const path = args.path as string
    const oldStr = args.old_string as string
    const newStr = args.new_string as string

    try {
      if (!existsSync(path)) {
        return { success: false, output: "", error: `File not found: ${path}` }
      }

      const file = Bun.file(path)
      const content = await file.text()
      const occurrences = content.split(oldStr).length - 1

      if (occurrences === 0) {
        return { success: false, output: "", error: "old_string not found in file" }
      }
      if (occurrences > 1) {
        return { success: false, output: "", error: `old_string found ${occurrences} times, must be unique` }
      }

      const updated = content.replace(oldStr, newStr)
      await Bun.write(path, updated)
      return { success: true, output: `Edited ${path}` }
    } catch (error) {
      return {
        success: false,
        output: "",
        error: error instanceof Error ? error.message : String(error),
      }
    }
  },
}
