import type { Command } from "../../../types/commands"

export const securityCommand: Command = {
  name: "security",
  description: "Security analysis (not implemented yet)",
  usage: "/security",
  executor() {
    return {
      success: false,
      message: "/security is not implemented yet. Planned: Semgrep scan + dependency audit.",
      error: "Not implemented",
    }
  },
}
