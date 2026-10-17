import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import * as schema from "../../drizzle/schema";

/**
 * Lazy Postgres client. Only connects when DATABASE_URL is set, so the app
 * keeps working (RSS fallback) without a database configured.
 * Works with Supabase, Neon, or any Postgres provider.
 */
let _db: ReturnType<typeof drizzle> | null = null;

export function isDbConfigured(): boolean {
  return !!process.env.DATABASE_URL;
}

export function getDb() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is not set");
  if (!_db) {
    const client = postgres(url, { max: 5, idle_timeout: 20 });
    _db = drizzle(client, { schema });
  }
  return _db;
}
