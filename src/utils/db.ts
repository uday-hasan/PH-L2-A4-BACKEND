import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import { config } from "../config/env";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Use a single pool instance
const pool = new Pool({ connectionString: config.database.url });
const adapter = new PrismaPg(pool);

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter, // This is now a stable feature
    log:
      config.nodeEnv === "development" ? ["query", "warn", "error"] : ["error"],
  });

if (config.nodeEnv !== "production") {
  globalForPrisma.prisma = prisma;
}
