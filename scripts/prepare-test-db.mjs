// Aplica las migraciones pendientes en la base de tests (TEST_DATABASE_URL).
// Los tests de integración vacían las tablas por su cuenta (ver tests/integration/helpers.ts).
import "dotenv/config";
import { execSync } from "node:child_process";

const url = process.env.TEST_DATABASE_URL;
if (!url) {
  console.log("TEST_DATABASE_URL no definida: se omiten los tests de integración.");
  process.exit(0);
}
if (!/_test\b/.test(new URL(url).pathname)) {
  console.error("TEST_DATABASE_URL debe apuntar a una base cuyo nombre termine en _test.");
  process.exit(1);
}
execSync("npx prisma migrate deploy", { stdio: "inherit", env: { ...process.env, DATABASE_URL: url } });
