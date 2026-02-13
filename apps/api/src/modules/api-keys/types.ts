export type ApiKeySummary = {
  id: string;
  name: string;
  kid: string;
  scopes: string[];
  createdAt: string;
  lastUsedAt: string | null;
  revokedAt: string | null;
};

export type ApiKeysPort = {
  list(
    userId: string,
    input: { limit?: number; cursor?: string },
  ): Promise<{
    items: ApiKeySummary[];
    nextCursor: string | null;
  }>;
};
