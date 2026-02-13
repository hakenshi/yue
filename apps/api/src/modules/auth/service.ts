import { status } from "elysia";
import type { AuthPort } from "../../types";

export function unauthorized() {
  return {
    error: {
      code: "UNAUTHORIZED",
      message: "Unauthorized",
    },
  };
}

export async function requireUser(
  auth: AuthPort,
  headers: Record<string, string | undefined>,
) {
  const me = await auth.requireUser(headers);
  if (!me) {
    throw status(401, unauthorized());
  }
  return me;
}
