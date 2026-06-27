import type { NextAuthConfig } from "next-auth";
import type { Role } from "@prisma/client";

/**
 * Edge-safe NextAuth config (no bcrypt / no Prisma) so it can be imported by
 * `middleware.ts`. The Credentials provider with the DB-backed `authorize`
 * lives in `auth.ts` (Node runtime).
 */
export const authConfig: NextAuthConfig = {
  trustHost: true,
  session: { strategy: "jwt" },
  pages: {
    signIn: "/admin/login",
  },
  providers: [],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        const u = user as { id?: string; role?: Role };
        token.id = String(u.id ?? "");
        token.role = (u.role ?? "VIEWER") as Role;
      }
      return token;
    },
    session({ session, token }) {
      if (token && session.user) {
        session.user.id = (token.id as string) ?? "";
        session.user.role = (token.role as Role) ?? "VIEWER";
      }
      return session;
    },
  },
};
