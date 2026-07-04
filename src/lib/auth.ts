import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { authConfig } from "@/lib/auth.config";
import { prisma } from "@/lib/db";
import { verifyPassword } from "@/lib/security";
import { verifyCaptcha } from "@/lib/captcha";
import { loginSchema } from "@/lib/validation/auth.schema";
import { log } from "@/lib/logger";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        captchaToken: { label: "Captcha token", type: "text" },
        captchaAnswer: { label: "Captcha", type: "text" },
      },
      async authorize(credentials) {
        // Verify the captcha before any DB work — stops credential-stuffing bots.
        const captchaToken =
          typeof credentials?.captchaToken === "string" ? credentials.captchaToken : "";
        const captchaAnswer =
          typeof credentials?.captchaAnswer === "string" ? credentials.captchaAnswer : "";
        if (!verifyCaptcha(captchaToken, captchaAnswer)) {
          log.auth("Login failed: captcha invalid");
          return null;
        }

        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const { email, password } = parsed.data;
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user || !user.isActive) {
          log.auth("Login failed: user not found or inactive", { email });
          return null;
        }

        const valid = await verifyPassword(password, user.passwordHash);
        if (!valid) {
          log.auth("Login failed: invalid password", { email });
          return null;
        }

        // Audit the successful login.
        await prisma.auditLog.create({
          data: {
            userId: user.id,
            action: "LOGIN",
            entityType: "User",
            entityId: user.id,
            details: `User ${user.email} signed in.`,
          },
        });
        log.auth("Login success", { userId: user.id, role: user.role });

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          image: user.image ?? undefined,
          sessionVersion: user.sessionVersion,
        };
      },
    }),
  ],
});
