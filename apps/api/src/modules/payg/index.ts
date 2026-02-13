import { Elysia } from "elysia";
import type { AuthPort } from "../../types";
import { requireUser } from "../auth/service";
import { PaygService, createDefaultPaygPort } from "./service";
import { PaygModel } from "./model";
import type { PaygPort } from "./types";

export const paygModule = (
  payg: PaygPort = createDefaultPaygPort(),
  auth: AuthPort,
) => {
  const service = new PaygService(payg);

  return new Elysia({ name: "payg-module" }).get(
    "/v1/payg/balance",
    async ({ headers }) => {
      const me = await requireUser(auth, headers);
      return service.getBalance(me.user.id);
    },
    {
      response: {
        200: PaygModel.balanceResponse,
        401: PaygModel.errorResponse,
      },
    },
  );
};
