import type { Tool } from "./types.ts"
import { Glob } from "bun"

export const globTool: Tool = {
  definition: {
    name: "glob",
    description: "Find files matching a glob pattern in a directory",
    parameters: [
      { name: "pattern", type: "string", description: "Glob pattern (e.g. **/*.ts)", required: true },
      { name: "cwd", type: "string", description: "Directory to search in (default: cwd)", required: false },
    ],
    requiresPermission: false,
  },
  async execute(args) {
    const pattern = args.pattern as string
    const cwd = (args.cwd as string) ?? process.cwd()

    try {
      const glob = new Glob(pattern)
      const matches: string[] = []
      for await (const file of glob.scan({ cwd, absolute: true })) {
        matches.push(file)
        if (matches.length >= 500) break
      }
      matches.sort()
      return {
        success: true,
        output: matches.length > 0 ? matches.join("\n") : "(no matches)",
      }
    } catch (error) {
      return {
        success: false,
        output: "",
        error: error instanceof Error ? error.message : String(error),
      }
    }
  },
}
