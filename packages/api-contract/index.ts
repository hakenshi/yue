import { Elysia, t } from "elysia"

export const api = new Elysia({ name: "yue-api" })
  .get(
    "/health",
    () => ({ ok: true }),
    {
      response: t.Object({
        ok: t.Boolean(),
      }),
      detail: {
        tags: ["system"],
      },
    },
  )
  .get(
    "/v1/version",
    () => ({
      name: "yue" as const,
      api: 1,
    }),
    {
      response: t.Object({
        name: t.Literal("yue"),
        api: t.Number(),
      }),
      detail: {
        tags: ["system"],
      },
    },
  )

export type ApiApp = typeof api
