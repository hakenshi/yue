import { edenTreaty } from "@elysiajs/eden"
import type { ApiApp } from "api-contract"

export type { ApiApp } from "api-contract"

export type ApiClient = ReturnType<typeof createApiClient>

export function createApiClient(baseUrl: string) {
  return edenTreaty<ApiApp>(baseUrl)
}
