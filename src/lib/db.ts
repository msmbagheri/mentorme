import { PrismaClient } from "@prisma/client";

// Singleton Prisma client. Prisma access is permitted ONLY inside the service layer
// (src/services/*). UI/public components must never import this directly.
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

export default prisma;
