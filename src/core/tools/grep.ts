import type { Tool } from "../../types/tools"

export const grepTool: Tool = {
  definition: {
    name: "grep",
    description: "Search file contents for a regex pattern using ripgrep",
    parameters: [
      { name: "pattern", type: "string", description: "Regex pattern to search for", required: true },
      { name: "path", type: "string", description: "File or directory to search (default: cwd)", required: false },
      { name: "glob", type: "string", description: "File glob filter (e.g. *.ts)", required: false },
    ],
    requiresPermission: false,
  },
  async execute(args) {
    const pattern = args.pattern as string
    const path = (args.path as string) ?? process.cwd()
    const fileGlob = args.glob as string | undefined

    try {
      const cmdArgs = ["rg", "--no-heading", "--line-number", "--color", "never"]
      if (fileGlob) cmdArgs.push("--glob", fileGlob)
      cmdArgs.push(pattern, path)

      const proc = Bun.spawn(cmdArgs, { stdout: "pipe", stderr: "pipe" })
      const timer = setTimeout(() => proc.kill(), 15000)
      await proc.exited
      clearTimeout(timer)

      const output = (await new Response(proc.stdout).text()).trim()
      return {
        success: true,
        output: output || "(no matches)",
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
