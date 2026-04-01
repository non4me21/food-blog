import { defineConfig } from "drizzle-kit"

if (!process.env.DATABASE_URL) {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  try { require("dotenv").config({ path: require("path").resolve(__dirname, "../.env") }) } catch {}
}

export default defineConfig({
  schema: "./db/schema.ts",
  out: "./db/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
})
