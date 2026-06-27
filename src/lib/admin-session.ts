import "server-only";
import { redirect } from "next/navigation";
import type { Session } from "next-auth";
import type { Role } from "@prisma/client";
import { auth } from "@/lib/auth";
import { can, type Capability, type Resource } from "@/lib/permissions";

export interface AdminSession {
  userId: string;
  role: Role;
  name: string | null;
  email: string | null;
  image: string | null;
}

function toAdminSession(session: Session): AdminSession {
  return {
    userId: session.user.id,
    role: session.user.role,
    name: session.user.name ?? null,
    email: session.user.email ?? null,
    image: session.user.image ?? null,
  };
}

/** Resolve the admin session or redirect to the login page. */
export async function requireSession(): Promise<AdminSession> {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/admin/login");
  }
  return toAdminSession(session);
}

/**
 * Require a session AND a capability on a resource. Redirects unauthenticated
 * users to login and authenticated-but-unauthorized users to the dashboard.
 */
export async function requireCan(
  resource: Resource,
  capability: Capability = "read",
): Promise<AdminSession> {
  const session = await requireSession();
  if (!can(session.role, capability, resource)) {
    redirect("/admin");
  }
  return session;
}
