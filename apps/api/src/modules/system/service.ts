import { SystemModel } from "./model";

export class SystemService {
  health() {
    return { ok: true as const };
  }

  version() {
    return { name: "yue" as const, api: 1 as const };
  }
}
