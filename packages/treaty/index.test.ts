import { describe, test, expect } from "bun:test"
import { createApiClient } from "./index"

describe("treaty", () => {
  test("creates a client", () => {
    const client = createApiClient("http://localhost:3000")

    expect(typeof client).toBe("object")
  })
})
