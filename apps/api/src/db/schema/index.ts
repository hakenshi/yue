import * as apiKeys from "./api-keys";
import * as payg from "./payg";
import * as providers from "./providers";

export const schema = {
  ...apiKeys,
  ...payg,
  ...providers,
};

export type DbSchema = typeof schema;
