import { PrismaClient } from "@prisma/client";

/**
 * Shared Prisma client for E2E DB-layer assertions. Tests use this to confirm a
 * mutation actually changed the row — not just that the UI showed a toast.
 * Connects to whatever DATABASE_URL the test process was launched with.
 */
declare global {
  // eslint-disable-next-line no-var
  var __e2ePrisma: PrismaClient | undefined;
}

export const db = global.__e2ePrisma ?? new PrismaClient();
if (!global.__e2ePrisma) global.__e2ePrisma = db;
