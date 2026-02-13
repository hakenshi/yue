export type UserSession = {
  id: string;
  email: string;
  name: string;
};

export type SessionInfo = {
  id: string;
  expiresAt: string;
};

export type AuthPort = {
  requireUser(headers: Record<string, string | undefined>): Promise<{
    user: UserSession;
    session: SessionInfo;
  } | null>;
};
