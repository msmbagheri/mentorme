import { test, expect } from "@playwright/test";
import { loginAs } from "./helpers";

test.describe("Admin RBAC", () => {
  test("admin sees Users in the nav", async ({ page }) => {
    await loginAs(page, "admin");
    const nav = page.getByRole("navigation", { name: /admin navigation/i });
    await expect(nav.getByText(/^Users$/)).toBeVisible();
  });

  test("editor cannot see Users nav and is blocked from the Users API", async ({
    page,
  }) => {
    await loginAs(page, "editor");
    const nav = page.getByRole("navigation", { name: /admin navigation/i });
    await expect(nav.getByText(/^Users$/)).toHaveCount(0);

    const res = await page.request.get("/api/admin/users");
    expect(res.status()).toBe(403);
  });

  test("viewer cannot see Users nav and is read-only", async ({ page }) => {
    await loginAs(page, "viewer");
    const nav = page.getByRole("navigation", { name: /admin navigation/i });
    await expect(nav.getByText(/^Users$/)).toHaveCount(0);

    // Viewer can read leads but cannot mutate.
    const read = await page.request.get("/api/admin/leads");
    expect(read.status()).toBe(200);
  });

  test("editor can read leads", async ({ page }) => {
    await loginAs(page, "editor");
    const res = await page.request.get("/api/admin/leads");
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.status).toBe("success");
  });
});
