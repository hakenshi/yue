import type { ApiKeysPort } from "./types";

export class ApiKeysService {
  constructor(private apiKeys: ApiKeysPort) {}

  list(userId: string, input: { limit?: number; cursor?: string }) {
    return this.apiKeys.list(userId, input);
  }
}

export function createDefaultApiKeysPort(): ApiKeysPort {
  return {
    async list(_userId, _input) {
      return {
        items: [],
        nextCursor: null,
      };
    },
  };
}
