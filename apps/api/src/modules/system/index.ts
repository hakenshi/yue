import { Elysia } from "elysia";
import { SystemService } from "./service";
import { SystemModel } from "./model";

export const systemModule = (service = new SystemService()) =>
  new Elysia({ name: "system-module" })
    .get("/health", () => service.health(), {
      response: {
        200: SystemModel.healthResponse,
      },
    })
    .get("/v1/version", () => service.version(), {
      response: {
        200: SystemModel.versionResponse,
      },
    });
