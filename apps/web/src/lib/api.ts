import { createApiClient } from "treaty"

const baseUrl = import.meta.env.PUBLIC_YUE_API_URL ?? "http://localhost:3000"

export const api = createApiClient(baseUrl)
