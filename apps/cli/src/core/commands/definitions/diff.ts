import type { Command } from "../../../types/commands"

function truncate(text: string, max = 12000): string {
  if (text.length <= max) return text
  return text.slice(0, max) + `\n\n...(truncated, ${text.length - max} chars omitted)`
}

async function runGitDiff(args: string[]): Promise<{ ok: boolean; output: string }>{
  try {
    const proc = Bun.spawn(["git", ...args], { stdout: "pipe", stderr: "pipe" })
    const exitCode = await proc.exited
    const stdout = await new Response(proc.stdout).text()
    const stderr = await new Response(proc.stderr).text()
    const out = [stdout.trimEnd(), stderr.trimEnd()].filter(Boolean).join("\n")
    return { ok: exitCode === 0, output: out || "(no output)" }
  } catch (e) {
    return { ok: false, output: e instanceof Error ? e.message : String(e) }
  }
}

export const diffCommand: Command = {
  name: "diff",
  description: "Show git diff for the repo or a file",
  usage: "/diff [file-path]",
  async executor(parsed) {
    const filePath = parsed.args[0]
    const args = filePath ? ["diff", "--", filePath] : ["diff"]
    const res = await runGitDiff(args)
    return {
      success: res.ok,
      message: truncate(res.output),
      error: res.ok ? undefined : res.output,
    }
  },
}
