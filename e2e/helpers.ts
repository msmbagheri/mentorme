import { type Page, expect } from "@playwright/test";

export const CREDENTIALS = {
  admin: { email: "admin@example.com", password: "Admin12345!", role: "ADMIN" },
  editor: { email: "editor@example.com", password: "Editor12345!", role: "EDITOR" },
  viewer: { email: "viewer@example.com", password: "Viewer12345!", role: "VIEWER" },
} as const;

export type RoleKey = keyof typeof CREDENTIALS;

/** Log in through the real admin login form and wait until inside /admin. */
export async function loginAs(page: Page, role: RoleKey) {
  const { email, password } = CREDENTIALS[role];
  await page.goto("/admin/login");
  await page.fill("#email", email);
  await page.fill("#password", password);
  await page.getByRole("button", { name: /sign in/i }).click();
  await expect(page).toHaveURL(/\/admin(\/|$)(?!login)/, { timeout: 15_000 });
}
