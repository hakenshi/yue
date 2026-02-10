import type { Command } from "../../../types/commands"
import {
  defaultOpinions,
  opinionsPath,
  readOpinionsRaw,
  writeOpinions,
} from "../../project/opinions.ts"

export const opinionsCommand: Command = {
  name: "opinions",
  description: "Manage global guardrails (~/.config/yue/opinions.yml)",
  usage: "/opinions [show|init|set \"text\"|clear]",
  executor(parsed) {
    const verb = parsed.subcommand ?? parsed.args[0]
    const rest = parsed.subcommand ? parsed.args : parsed.args.slice(1)

    if (verb === "show" || !verb) {
      const raw = readOpinionsRaw().trimEnd()
      const path = opinionsPath()
      return {
        success: true,
        message: raw ? `${path}\n\n${raw}` : `${path}\n\n(missing)`
      }
    }

    if (verb === "init") {
      writeOpinions(defaultOpinions())
      return { success: true, message: `Wrote default opinions to ${opinionsPath()}` }
    }

    if (verb === "clear") {
      writeOpinions({ version: 1, rules: [] })
      return { success: true, message: `Cleared opinions at ${opinionsPath()}` }
    }

    if (verb === "set") {
      const text = rest.join(" ").trim()
      if (!text) {
        return { success: false, message: "Usage: /opinions set \"text\"", error: "Missing text" }
      }
      writeOpinions({ version: 1, rules: [{ id: "custom", level: "error", text }] })
      return { success: true, message: `Updated opinions at ${opinionsPath()}` }
    }

    return { success: false, message: "Usage: /opinions [show|init|set \"...\"|clear]", error: "Unknown subcommand" }
  },
}
