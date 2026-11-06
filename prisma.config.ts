import "dotenv/config";
import { defineConfig, env } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.mts",
  },
  datasource: {
    // Las migraciones usan la conexión directa de Neon (DATABASE_URL_UNPOOLED) si existe.
    url: process.env.DATABASE_URL_UNPOOLED || env("DATABASE_URL"),
  },
});
