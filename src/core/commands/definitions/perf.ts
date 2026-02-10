import type { Command } from "../../../types/commands"

export const perfCommand: Command = {
  name: "perf",
  description: "Performance analysis (not implemented yet)",
  usage: "/perf",
  executor() {
    return {
      success: false,
      message: "/perf is not implemented yet. Planned: basic heuristics + hot paths summary.",
      error: "Not implemented",
    }
  },
}
