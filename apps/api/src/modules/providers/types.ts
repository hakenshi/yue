export type ProviderDefinition = {
  id: string;
  label: string;
  recommended: boolean;
  description: string;
  supportedWires: string[];
  supportedAuth: string[];
};

export type ProviderConnection = {
  providerId: string;
  enabled: boolean;
  status: "connected" | "disconnected" | "error";
  labelOverride: string | null;
  connectedAt: string | null;
  lastError: string | null;
};

export type ProvidersPort = {
  listDefinitions(): {
    popular: ProviderDefinition[];
    other: ProviderDefinition[];
  };
  listConnections(userId: string): Promise<ProviderConnection[]>;
};
