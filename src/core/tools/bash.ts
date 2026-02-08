import type { Tool } from "./types.ts"

export const bashTool: Tool = {
  definition: {
    name: "bash",
    description: "Execute a shell command and return stdout/stderr",
    parameters: [
      { name: "command", type: "string", description: "The shell command to execute", required: true },
      { name: "timeout", type: "number", description: "Timeout in milliseconds (default: 30000)", required: false },
    ],
    requiresPermission: true,
  },
  async execute(args) {
    const command = args.command as string
    const timeout = (args.timeout as number) ?? 30000

    try {
      const proc = Bun.spawn(["bash", "-c", command], {
        stdout: "pipe",
        stderr: "pipe",
      })

      const timer = setTimeout(() => proc.kill(), timeout)
      const exitCode = await proc.exited
      clearTimeout(timer)

      const stdout = await new Response(proc.stdout).text()
      const stderr = await new Response(proc.stderr).text()
      const output = [stdout.trim(), stderr.trim()].filter(Boolean).join("\n")

      return {
        success: exitCode === 0,
        output: output || "(no output)",
        error: exitCode !== 0 ? `Exit code: ${exitCode}` : undefined,
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
