import { defineConfig } from "drizzle-kit";

const dbUrl =
  process.env.DATABASE_URL ?? "postgresql://echo:echo@localhost:5432/echo";

export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./src/db/migrations",
  dialect: "postgresql",
  dbCredentials: { url: dbUrl },
  strict: true,
  verbose: true,
});
