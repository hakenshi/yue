import type { YueConfig } from "../config/schema.ts"

export type PermissionStatus = "approved" | "denied" | "pending"

type PermissionCallback = (
  toolName: string,
  args: Record<string, unknown>,
) => Promise<PermissionStatus>

let permissionHandler: PermissionCallback | null = null

export function setPermissionHandler(handler: PermissionCallback) {
  permissionHandler = handler
}

export async function checkPermission(
  config: YueConfig,
  toolName: string,
  args: Record<string, unknown>,
): Promise<PermissionStatus> {
  if (config.permissions.autoApprove.includes(toolName)) {
    return "approved"
  }

  if (config.permissions.autoApprove.includes("*")) {
    return "approved"
  }

  if (permissionHandler) {
    return permissionHandler(toolName, args)
  }

  return "pending"
}
