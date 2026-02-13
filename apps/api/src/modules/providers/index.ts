import { Elysia } from "elysia";
import type { AuthPort } from "../../types";
import { requireUser } from "../auth/service";
import { ProvidersService, createDefaultProvidersPort } from "./service";
import { ProviderModel } from "./model";
import type { ProvidersPort } from "./types";

export const providersModule = (
  providers: ProvidersPort = createDefaultProvidersPort(),
  auth: AuthPort,
) => {
  const service = new ProvidersService(providers);

  return new Elysia({ name: "providers-module" })
    .get("/v1/providers/definitions", () => service.listDefinitions(), {
      response: {
        200: ProviderModel.definitionsResponse,
      },
    })
    .get(
      "/v1/providers/connections",
      async ({ headers }) => {
        const me = await requireUser(auth, headers);
        return {
          items: await service.listConnections(me.user.id),
        };
      },
      {
        response: {
          200: ProviderModel.listConnectionsResponse,
          401: ProviderModel.errorResponse,
        },
      },
    );
};
