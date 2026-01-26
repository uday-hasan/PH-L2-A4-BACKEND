import "dotenv/config";
import { defineConfig, env } from "prisma/config";
import { config } from "./src/config/env";

export default defineConfig({
  schema: "prisma/schema",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: config.database.url,
  },
});
