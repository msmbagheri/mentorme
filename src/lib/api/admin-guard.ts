import { ZodError } from "zod";
import { auth } from "@/lib/auth";
import { PermissionError } from "@/lib/permissions";
import { forbidden, unauthorized, fromZodError, serverError } from "@/lib/api-response";
import { getClientIp, getUserAgent } from "@/lib/security";
import { log } from "@/lib/logger";
import type { Role } from "@prisma/client";

export interface AdminContext {
  userId: string;
  role: Role;
  ipAddress: string;
  userAgent: string;
}

/**
 * Resolve the authenticated admin session for an API route. Returns either an
 * AdminContext or a ready-to-return NextResponse (401) when unauthenticated.
 */
export async function requireAdmin(
  req: Request,
): Promise<AdminContext | { response: ReturnType<typeof unauthorized> }> {
  const session = await auth();
  if (!session?.user?.id) {
    return { response: unauthorized() };
  }
  return {
    userId: session.user.id,
    role: session.user.role,
    ipAddress: getClientIp(req),
    userAgent: getUserAgent(req),
  };
}

export function isResponse(
  ctx: AdminContext | { response: ReturnType<typeof unauthorized> },
): ctx is { response: ReturnType<typeof unauthorized> } {
  return "response" in ctx;
}

/** Maps thrown errors to the standard envelope responses. */
export function handleApiError(error: unknown) {
  if (error instanceof PermissionError) {
    log.permission(error.message);
    return forbidden(error.message);
  }
  if (error instanceof ZodError) {
    return fromZodError(error);
  }
  log.error("API error", { error: error instanceof Error ? error.message : String(error) });
  return serverError();
}
