import type { Command } from "../../../types/commands"

export const skipPermissionsCommand: Command = {
  name: "skip-permissions",
  description: "Auto-approve all tool executions",
  usage: "/skip-permissions",
  executor(_parsed, context) {
    context.config.permissions.autoApprove = ["*"]
    return { success: true, message: "Permissions: auto-approve enabled for all tools (autoApprove: [*])." }
  },
}
