import { describe, test, expect } from "bun:test"
import { api } from "./index"

describe("api-contract", () => {
  test("GET /health", async () => {
    const res = await api.handle(new Request("http://localhost/health"))

    expect(res.status).toBe(200)
    expect(await res.json()).toEqual({ ok: true })
  })

  test("GET /v1/version", async () => {
    const res = await api.handle(new Request("http://localhost/v1/version"))

    expect(res.status).toBe(200)
    expect(await res.json()).toEqual({ name: "yue", api: 1 })
  })

  test("404 for unknown route", async () => {
    const res = await api.handle(new Request("http://localhost/nope"))

    expect(res.status).toBe(404)
  })
})
