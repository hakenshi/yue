import { t } from "elysia";

export const errorResponse = t.Object({
  error: t.Object({
    code: t.String(),
    message: t.String(),
    details: t.Optional(t.Record(t.String(), t.Unknown())),
  }),
});

export const centsString = t.String({ pattern: "^[0-9]+$" });
export const cursorQuery = t.Object({
  limit: t.Optional(t.Integer({ minimum: 1, maximum: 200 })),
  cursor: t.Optional(t.String()),
});
