import "dotenv/config";
import { defineConfig, devices } from "@playwright/test";

const PORT = Number(process.env.E2E_PORT ?? 3210);
const baseURL = `http://localhost:${PORT}`;
const DATABASE_URL = process.env.E2E_DATABASE_URL ?? "";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false,
  workers: 1,
  retries: 0,
  timeout: 60_000,
  reporter: [["list"]],
  use: {
    baseURL,
    locale: "es-HN",
    timezoneId: "America/Tegucigalpa",
    trace: "off",
    // Permite usar un Chromium ya instalado (PLAYWRIGHT_CHROMIUM_PATH) en lugar de `npx playwright install`.
    launchOptions: process.env.PLAYWRIGHT_CHROMIUM_PATH ? { executablePath: process.env.PLAYWRIGHT_CHROMIUM_PATH } : {},
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    // Prepara la base e2e y luego levanta el build de producción (ejecute `npm run build` antes).
    command: `node scripts/prepare-e2e-db.mjs && npx next start -p ${PORT}`,
    url: baseURL,
    reuseExistingServer: false,
    timeout: 180_000,
    env: {
      DATABASE_URL,
      APP_URL: baseURL,
      BETTER_AUTH_URL: baseURL,
      REQUIRE_EMAIL_VERIFICATION: "false",
      EMAIL_DRIVER: "console",
      STORAGE_DRIVER: process.env.E2E_STORAGE_DRIVER ?? "local",
      STORAGE_LOCAL_DIR: "./storage-e2e",
    },
  },
});
