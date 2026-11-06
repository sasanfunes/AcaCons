import "dotenv/config";

// Los tests de integración usan una base separada.
if (process.env.TEST_DATABASE_URL) {
  process.env.DATABASE_URL = process.env.TEST_DATABASE_URL;
}
