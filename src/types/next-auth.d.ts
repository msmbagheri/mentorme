import type { Role } from "@prisma/client";
import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: Role;
      /** DB session version at sign-in; compared against the user row to force logout on password change. */
      sessionVersion: number;
      /** Epoch ms when this session was issued; used for the 24h hard-expiry cap. */
      loginAt: number;
    } & DefaultSession["user"];
  }

  interface User {
    role: Role;
    sessionVersion: number;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: Role;
    sessionVersion: number;
    loginAt: number;
  }
}
