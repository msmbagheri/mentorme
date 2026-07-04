import type { NextAuthConfig } from "next-auth";
import type { Role } from "@prisma/client";

/**
 * Edge-safe NextAuth config (no bcrypt / no Prisma) so it can be imported by
 * `middleware.ts`. The Credentials provider with the DB-backed `authorize`
 * lives in `auth.ts` (Node runtime).
 */
/** Admin session lifetime: 24 hours, then the JWT expires and the user must sign in again. */
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24;

export const authConfig: NextAuthConfig = {
  trustHost: true,
  session: { strategy: "jwt", maxAge: SESSION_MAX_AGE_SECONDS },
  jwt: { maxAge: SESSION_MAX_AGE_SECONDS },
  pages: {
    signIn: "/admin/login",
  },
  providers: [],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        const u = user as { id?: string; role?: Role; sessionVersion?: number };
        token.id = String(u.id ?? "");
        token.role = (u.role ?? "VIEWER") as Role;
        token.sessionVersion = u.sessionVersion ?? 0;
        // Stamp the issue time so the Node-runtime guards can enforce a hard
        // 24h-from-login cap regardless of session-refresh sliding.
        token.loginAt = Date.now();
      }
      return token;
    },
    session({ session, token }) {
      if (token && session.user) {
        session.user.id = (token.id as string) ?? "";
        session.user.role = (token.role as Role) ?? "VIEWER";
        session.user.sessionVersion = (token.sessionVersion as number) ?? 0;
        session.user.loginAt = (token.loginAt as number) ?? 0;
      }
      return session;
    },
  },
};
