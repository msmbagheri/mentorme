import { PrismaClient } from "@prisma/client";
import { purgeE2E } from "./purge";

/**
 * After the whole suite, purge E2E fixtures and VERIFY zero remain. Guarded by
 * E2E_PURGE=1 so it only runs when explicitly enabled (always set it for the
 * production run; local runs re-seed instead). A second purge pass must return 0,
 * proving no tagged test data is left on the (production) DB.
 */
export default async function globalTeardown() {
  if (process.env.E2E_PURGE !== "1") return;
  const db = new PrismaClient();
  try {
    const removed = await purgeE2E(db);
    const remaining = await purgeE2E(db);
    // eslint-disable-next-line no-console
    console.log(`[E2E purge] removed ${removed} fixture rows; ${remaining} remaining after re-scan.`);
    if (remaining !== 0) {
      throw new Error(`E2E purge INCOMPLETE — ${remaining} tagged rows still present.`);
    }
  } finally {
    await db.$disconnect();
  }
}
