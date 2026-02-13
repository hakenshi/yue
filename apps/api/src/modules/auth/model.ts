import { t } from "elysia";
import { errorResponse } from "../../common";

export const AuthModel = {
  meResponse: t.Object({
    user: t.Object({
      id: t.String(),
      email: t.String(),
      name: t.String(),
    }),
    session: t.Object({
      id: t.String(),
      expiresAt: t.String(),
    }),
  }),
  errorResponse,
};
