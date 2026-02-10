import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs"
import { join } from "path"
import yaml from "js-yaml"

export interface YueLocalState {
  version: number
  activeFeature?: string
}

function yueDir(cwd: string = process.cwd()): string {
  return join(cwd, ".yue")
}

export function statePath(cwd: string = process.cwd()): string {
  return join(yueDir(cwd), "state.yml")
}

export function readLocalState(cwd: string = process.cwd()): YueLocalState {
  const path = statePath(cwd)
  if (!existsSync(path)) return { version: 1 }
  try {
    const raw = readFileSync(path, "utf-8")
    const doc = (yaml.load(raw) as any) ?? {}
    if (!doc || typeof doc !== "object") return { version: 1 }
    return {
      version: typeof doc.version === "number" ? doc.version : 1,
      activeFeature: typeof doc.activeFeature === "string" ? doc.activeFeature : undefined,
    }
  } catch {
    return { version: 1 }
  }
}

export function writeLocalState(state: YueLocalState, cwd: string = process.cwd()) {
  const dir = yueDir(cwd)
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true })
  const content = yaml.dump(state, { lineWidth: 100 })
  writeFileSync(statePath(cwd), content, "utf-8")
}
