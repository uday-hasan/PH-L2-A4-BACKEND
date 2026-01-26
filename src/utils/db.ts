import { config } from "../config/env";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client";

/* ----------------------------------
   2. Prisma adapter (NO pg.Pool)
----------------------------------- */
const adapter = new PrismaPg({
  connectionString: config.database.url, // Neon pooled URL
});

/* ----------------------------------
   3. Prisma singleton (serverless-safe)
----------------------------------- */
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter,
    log:
      config.nodeEnv === "development" ? ["query", "warn", "error"] : ["error"],
  });

if (config.nodeEnv !== "production") {
  globalForPrisma.prisma = prisma;
}
