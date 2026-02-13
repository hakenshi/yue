import type { ProvidersPort, ProviderDefinition } from "./types";

export class ProvidersService {
  constructor(private providers: ProvidersPort) {}

  listDefinitions(): {
    popular: ProviderDefinition[];
    other: ProviderDefinition[];
  } {
    return this.providers.listDefinitions();
  }

  listConnections(userId: string) {
    return this.providers.listConnections(userId);
  }
}

export function createDefaultProvidersPort(): ProvidersPort {
  return {
    listDefinitions() {
      return {
        popular: [
          {
            id: "nightly",
            label: "Nightly",
            recommended: true,
            description: "First-party Yue provider",
            supportedWires: ["responses"],
            supportedAuth: ["bearer"],
          },
        ],
        other: [],
      };
    },
    async listConnections() {
      return [];
    },
  };
}
