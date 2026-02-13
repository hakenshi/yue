import type { AuthPort } from "../../types";

export function createDefaultAuthPort(): AuthPort {
  return {
    async requireUser() {
      return null;
    },
  };
}
