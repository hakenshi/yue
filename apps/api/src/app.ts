import { Elysia } from "elysia";
import { systemModule } from "./modules/system";
import { authModule } from "./modules/auth";
import { providersModule } from "./modules/providers";
import { paygModule } from "./modules/payg";
import { apiKeysModule } from "./modules/api-keys";
import { createDefaultAuthPort } from "./modules/auth/default";
import { createDefaultProvidersPort } from "./modules/providers/service";
import { createDefaultPaygPort } from "./modules/payg/service";
import { createDefaultApiKeysPort } from "./modules/api-keys/service";
import type { AuthPort } from "./types";
import type { ProvidersPort } from "./modules/providers/types";
import type { PaygPort } from "./modules/payg/types";
import type { ApiKeysPort } from "./modules/api-keys/types";

type ApiDeps = {
  auth: AuthPort;
  providers: ProvidersPort;
  payg: PaygPort;
  apiKeys: ApiKeysPort;
};

function buildDefaultDeps(): ApiDeps {
  return {
    auth: createDefaultAuthPort(),
    providers: createDefaultProvidersPort(),
    payg: createDefaultPaygPort(),
    apiKeys: createDefaultApiKeysPort(),
  };
}

export function createApi(deps: ApiDeps = buildDefaultDeps()) {
  return new Elysia({ name: "yue-api" })
    .use(systemModule())
    .use(authModule(deps.auth))
    .use(providersModule(deps.providers, deps.auth))
    .use(paygModule(deps.payg, deps.auth))
    .use(apiKeysModule(deps.apiKeys, deps.auth));
}

export const api = createApi();

export type App = ReturnType<typeof createApi>;
