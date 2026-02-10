import type { Command } from "../../../types/commands"

export const reviewCommand: Command = {
  name: "review",
  description: "Comprehensive code review (not implemented yet)",
  usage: "/review",
  executor() {
    return {
      success: false,
      message: "/review is not implemented yet. Planned: run diff + static checks + structured findings.",
      error: "Not implemented",
    }
  },
}
