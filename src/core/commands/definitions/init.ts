import type { Command } from "../../../types/commands"
import { existsSync, mkdirSync, writeFileSync } from "fs"
import { join } from "path"

function ensureDir(path: string) {
  if (!existsSync(path)) mkdirSync(path, { recursive: true })
}

function ensureFile(path: string, content: string) {
  if (!existsSync(path)) writeFileSync(path, content, "utf-8")
}

export const initCommand: Command = {
  name: "init",
  description: "Initialize .yue/ project structure",
  usage: "/init",
  executor() {
    const root = join(process.cwd(), ".yue")
    ensureDir(root)
    ensureDir(join(root, "adrs"))
    ensureDir(join(root, "features"))

    ensureFile(join(root, "agents.md"), "# Yue Project Rules\n\n")
    ensureFile(join(root, "tracker.yml"), "# Auto-generated progress tracker\n")
    ensureFile(join(root, "memory.yml"), "# Project decisions/constraints\n")
    ensureFile(join(root, "repos.yml"), "# Multi-repo configuration\n")

    return { success: true, message: "Initialized .yue/ (agents.md, tracker.yml, memory.yml, adrs/, features/, repos.yml)." }
  },
}
