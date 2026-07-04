import "server-only";
import type { Session } from "next-auth";
import { prisma } from "@/lib/db";

/** Hard cap on an admin session's lifetime, measured from sign-in (24 hours). */
const SESSION_MAX_AGE_MS = 1000 * 60 * 60 * 24;

/**
 * A JWT session is "stale" when it no longer reflects the current DB state or
 * has outlived the 24h hard cap. This runs in the Node runtime (needs Prisma),
 * so it lives in the API/page guards rather than the edge middleware:
 *  - password changed since sign-in → `sessionVersion` bumped, tokens no longer match
 *  - account deactivated
 *  - more than 24h since the token was issued (hard expiry, ignores refresh sliding)
 */
export async function isSessionStale(session: Session): Promise<boolean> {
  const loginAt = session.user.loginAt;
  if (typeof loginAt === "number" && loginAt > 0 && Date.now() - loginAt > SESSION_MAX_AGE_MS) {
    return true;
  }

  const dbUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { isActive: true, sessionVersion: true },
  });
  if (!dbUser || !dbUser.isActive) return true;

  return dbUser.sessionVersion !== (session.user.sessionVersion ?? 0);
}
