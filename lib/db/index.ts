import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";

function getDatabaseUrl() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error("DATABASE_URL is not set. Add it to .env.local");
  }
  return url;
}

const pool = new Pool({ connectionString: getDatabaseUrl() });

export const db = drizzle(pool, { schema });
export type Database = typeof db;
