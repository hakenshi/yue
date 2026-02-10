import type { YueConfig } from "../../types/config"
import type { PermissionStatus } from "../../types/permission"

export class PermissionChecker {
  constructor(private config: YueConfig) {}

  check(toolName: string): PermissionStatus {
    if (this.config.permissions.autoApprove.includes(toolName)) return "approved"
    if (this.config.permissions.autoApprove.includes("*")) return "approved"
    return "pending"
  }
}
