import { Elysia } from "elysia";
import type { AuthPort } from "../../types";
import { requireUser } from "../auth/service";
import { ApiKeysService, createDefaultApiKeysPort } from "./service";
import { ApiKeysModel } from "./model";
import type { ApiKeysPort } from "./types";

export const apiKeysModule = (
  apiKeys: ApiKeysPort = createDefaultApiKeysPort(),
  auth: AuthPort,
) => {
  const service = new ApiKeysService(apiKeys);

  return new Elysia({ name: "api-keys-module" }).get(
    "/v1/api-keys",
    async ({ headers, query }) => {
      const me = await requireUser(auth, headers);
      return service.list(me.user.id, query);
    },
    {
      query: ApiKeysModel.listQuery,
      response: {
        200: ApiKeysModel.listResponse,
        401: ApiKeysModel.errorResponse,
      },
    },
  );
};
