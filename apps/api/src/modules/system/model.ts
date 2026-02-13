import { t } from "elysia";

export namespace SystemModel {
  export const healthResponse = t.Object({
    ok: t.Literal(true),
  });

  export const versionResponse = t.Object({
    name: t.Literal("yue"),
    api: t.Literal(1),
  });
}
