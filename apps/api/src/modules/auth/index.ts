import { Elysia } from "elysia";
import type { AuthPort } from "../../types";
import { requireUser } from "./service";
import { AuthModel } from "./model";

export const authModule = (auth: AuthPort) =>
  new Elysia({ name: "auth-module" }).get(
    "/v1/me",
    async ({ headers }) => requireUser(auth, headers),
    {
      response: {
        200: AuthModel.meResponse,
        401: AuthModel.errorResponse,
      },
    },
  );
