import { describe, test, expect } from "bun:test"
import { api } from "./app"

describe("apps/api", () => {
  test("serves /health", async () => {
    const res = await api.handle(new Request("http://localhost/health"))
    expect(res.status).toBe(200)
    expect(await res.json()).toEqual({ ok: true })
  })
})
