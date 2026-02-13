import { t } from "elysia";
import { errorResponse } from "../../common";

export const ProviderModel = {
  definition: t.Object({
    id: t.String(),
    label: t.String(),
    recommended: t.Boolean(),
    description: t.String(),
    supportedWires: t.Array(t.String()),
    supportedAuth: t.Array(t.String()),
  }),

  definitionsResponse: t.Object({
    popular: t.Array(
      t.Object({
        id: t.String(),
        label: t.String(),
        recommended: t.Boolean(),
        description: t.String(),
        supportedWires: t.Array(t.String()),
        supportedAuth: t.Array(t.String()),
      }),
    ),
    other: t.Array(
      t.Object({
        id: t.String(),
        label: t.String(),
        recommended: t.Boolean(),
        description: t.String(),
        supportedWires: t.Array(t.String()),
        supportedAuth: t.Array(t.String()),
      }),
    ),
  }),

  connection: t.Object({
    providerId: t.String(),
    enabled: t.Boolean(),
    status: t.Union([
      t.Literal("connected"),
      t.Literal("disconnected"),
      t.Literal("error"),
    ]),
    labelOverride: t.Union([t.String(), t.Null()]),
    connectedAt: t.Union([t.String(), t.Null()]),
    lastError: t.Union([t.String(), t.Null()]),
  }),

  listConnectionsResponse: t.Object({
    items: t.Array(
      t.Object({
        providerId: t.String(),
        enabled: t.Boolean(),
        status: t.Union([
          t.Literal("connected"),
          t.Literal("disconnected"),
          t.Literal("error"),
        ]),
        labelOverride: t.Union([t.String(), t.Null()]),
        connectedAt: t.Union([t.String(), t.Null()]),
        lastError: t.Union([t.String(), t.Null()]),
      }),
    ),
  }),

  errorResponse,
};
