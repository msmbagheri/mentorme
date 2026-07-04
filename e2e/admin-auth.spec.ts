import { test, expect } from "@playwright/test";
import { loginAs, fillCaptcha, CREDENTIALS } from "./helpers";

test.describe("Admin authentication", () => {
  test("unauthenticated /admin redirects to login", async ({ page }) => {
    await page.goto("/admin");
    await expect(page).toHaveURL(/\/admin\/login/);
  });

  test("wrong credentials show an error", async ({ page }) => {
    await page.goto("/admin/login");
    await page.fill("#email", "admin@example.com");
    await page.fill("#password", "WRONG-password");
    await fillCaptcha(page);
    await page.getByRole("button", { name: /sign in/i }).click();
    await expect(page.getByText(/invalid email, password, or captcha/i)).toBeVisible();
    await expect(page).toHaveURL(/\/admin\/login/);
  });

  test("admin can log in and reach the dashboard", async ({ page }) => {
    await loginAs(page, "admin");
    await expect(page).toHaveURL(/\/admin(\/|$)/);
    // Dashboard shows the admin nav landmark.
    await expect(page.getByRole("navigation", { name: /admin navigation/i })).toBeVisible();
  });

  test("admin can sign out", async ({ page }) => {
    await loginAs(page, "admin");
    // Open the user menu and click sign out.
    const trigger = page.getByRole("button").filter({ hasText: /admin|account|user/i }).first();
    if (await trigger.count()) {
      await trigger.click();
    }
    const signOut = page.getByText(/sign out/i).first();
    await signOut.click();
    await expect(page).toHaveURL(/\/admin\/login/, { timeout: 15_000 });
  });

  test.describe("each seeded role can log in", () => {
    for (const role of Object.keys(CREDENTIALS) as (keyof typeof CREDENTIALS)[]) {
      test(`${role} login`, async ({ page }) => {
        await loginAs(page, role);
        await expect(page).toHaveURL(/\/admin(\/|$)/);
      });
    }
  });
});
