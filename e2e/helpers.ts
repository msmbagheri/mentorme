import { type Page, expect } from "@playwright/test";

// Credentials default to the local seed accounts. For the PRODUCTION run, point
// the admin role at a DEDICATED E2E account (separate from real users) via
// E2E_ADMIN_EMAIL / E2E_ADMIN_PASSWORD so write tests never touch a real login.
export const CREDENTIALS = {
  admin: {
    email: process.env.E2E_ADMIN_EMAIL ?? "admin@example.com",
    password: process.env.E2E_ADMIN_PASSWORD ?? "Admin12345!",
    role: "ADMIN",
  },
  editor: {
    email: process.env.E2E_EDITOR_EMAIL ?? "editor@example.com",
    password: process.env.E2E_EDITOR_PASSWORD ?? "Editor12345!",
    role: "EDITOR",
  },
  viewer: {
    email: process.env.E2E_VIEWER_EMAIL ?? "viewer@example.com",
    password: process.env.E2E_VIEWER_PASSWORD ?? "Viewer12345!",
    role: "VIEWER",
  },
} as const;

export type RoleKey = keyof typeof CREDENTIALS;

/**
 * The login captcha answer. In non-production runs with CAPTCHA_TEST_BYPASS=1
 * the server accepts this sentinel (see src/lib/captcha.ts); the E2E webServer
 * sets that env (dev mode) so the double-gated bypass never affects real prod.
 */
export const CAPTCHA_BYPASS_ANSWER = "TESTBYPASS";

/** Fill the login captcha field with the test-bypass sentinel. */
export async function fillCaptcha(page: Page) {
  const field = page.locator("#captcha");
  if (await field.count()) await field.fill(CAPTCHA_BYPASS_ANSWER);
}

/** Log in through the real admin login form and wait until inside /admin. */
export async function loginAs(page: Page, role: RoleKey) {
  const { email, password } = CREDENTIALS[role];
  await page.goto("/admin/login");
  await page.fill("#email", email);
  await page.fill("#password", password);
  await fillCaptcha(page);
  await page.getByRole("button", { name: /sign in/i }).click();
  await expect(page).toHaveURL(/\/admin(\/|$)(?!login)/, { timeout: 15_000 });
}
