import { t } from "elysia";
import { errorResponse, cursorQuery } from "../../common";

export const ApiKeysModel = {
  summary: t.Object({
    id: t.String(),
    name: t.String(),
    kid: t.String(),
    scopes: t.Array(t.String()),
    createdAt: t.String(),
    lastUsedAt: t.Union([t.String(), t.Null()]),
    revokedAt: t.Union([t.String(), t.Null()]),
  }),

  listQuery: cursorQuery,

  listResponse: t.Object({
    items: t.Array(
      t.Object({
        id: t.String(),
        name: t.String(),
        kid: t.String(),
        scopes: t.Array(t.String()),
        createdAt: t.String(),
        lastUsedAt: t.Union([t.String(), t.Null()]),
        revokedAt: t.Union([t.String(), t.Null()]),
      }),
    ),
    nextCursor: t.Union([t.String(), t.Null()]),
  }),

  errorResponse,
};
