import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs"
import { join } from "path"

export function agentsPath(cwd: string = process.cwd()): string {
  return join(cwd, ".yue", "agents.md")
}

export function readAgentsRules(cwd: string = process.cwd()): string {
  const path = agentsPath(cwd)
  if (!existsSync(path)) return ""
  try {
    return readFileSync(path, "utf-8")
  } catch {
    return ""
  }
}

export function writeAgentsRules(content: string, cwd: string = process.cwd()) {
  const dir = join(cwd, ".yue")
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true })
  writeFileSync(agentsPath(cwd), content, "utf-8")
}
