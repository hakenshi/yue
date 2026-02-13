import { describe, test, expect } from "bun:test";
import { api } from "../../../apps/api/src/app";

describe("apps/api", () => {
  test("serves /health", async () => {
    const res = await api.handle(new Request("http://localhost/health"));
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true });
  });

  test("serves /v1/version", async () => {
    const res = await api.handle(new Request("http://localhost/v1/version"));
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ name: "yue", api: 1 });
  });

  test("returns providers definitions", async () => {
    const res = await api.handle(
      new Request("http://localhost/v1/providers/definitions"),
    );

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(Array.isArray(body.popular)).toBe(true);
    expect(body.popular[0]?.id).toBe("nightly");
  });

  test("rejects unauthorized /v1/me", async () => {
    const res = await api.handle(new Request("http://localhost/v1/me"));
    expect(res.status).toBe(401);
    expect(await res.json()).toEqual({
      error: { code: "UNAUTHORIZED", message: "Unauthorized" },
    });
  });

  test("rejects unauthorized /v1/payg/balance", async () => {
    const res = await api.handle(
      new Request("http://localhost/v1/payg/balance"),
    );
    expect(res.status).toBe(401);
    expect(await res.json()).toEqual({
      error: { code: "UNAUTHORIZED", message: "Unauthorized" },
    });
  });

  test("rejects unauthorized /v1/api-keys", async () => {
    const res = await api.handle(new Request("http://localhost/v1/api-keys"));
    expect(res.status).toBe(401);
    expect(await res.json()).toEqual({
      error: { code: "UNAUTHORIZED", message: "Unauthorized" },
    });
  });
});
