// Prepara la base exclusiva de e2e (E2E_DATABASE_URL): migra, vacía las tablas y siembra datos de ejemplo.
import "dotenv/config";
import { execSync } from "node:child_process";
import pg from "pg";

const url = process.env.E2E_DATABASE_URL;
if (!url || !/_e2e\b/.test(new URL(url).pathname)) {
  console.error("Defina E2E_DATABASE_URL apuntando a una base cuyo nombre termine en _e2e");
  process.exit(1);
}
const env = { ...process.env, DATABASE_URL: url, STORAGE_DRIVER: "local", STORAGE_LOCAL_DIR: "./storage-e2e", NODE_ENV: "test" };
execSync("npx prisma migrate deploy", { stdio: "inherit", env });
const client = new pg.Client({ connectionString: url });
await client.connect();
const { rows } = await client.query(
  "SELECT tablename FROM pg_tables WHERE schemaname = 'public' AND tablename <> '_prisma_migrations'",
);
if (rows.length) await client.query(`TRUNCATE ${rows.map((r) => `"${r.tablename}"`).join(", ")} CASCADE`);
await client.end();
execSync("npx tsx prisma/seed.mts", { stdio: "inherit", env });
