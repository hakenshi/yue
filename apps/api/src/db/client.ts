import { drizzle } from "drizzle-orm/bun-sql";

import { schema } from "./schema";

export function createDb(databaseUrl: string) {
  return drizzle(databaseUrl, {
    schema,
  });
}

let _db: ReturnType<typeof createDb> | null = null;

export function getDb() {
  if (_db) return _db;

  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is required");

  _db = createDb(url);
  return _db;
}
