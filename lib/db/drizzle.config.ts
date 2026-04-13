import { defineConfig } from "drizzle-kit";
import { config as loadEnv } from "dotenv";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(here, "../..");

loadEnv({ path: resolve(repoRoot, ".env") });
loadEnv({ path: resolve(repoRoot, ".env.local"), override: true });

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL is not set. Add it to the shell, or to .env / .env.local at the repository root.",
  );
}

export default defineConfig({
  schema: resolve(here, "./schema/index.ts"),
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL,
  },
});
