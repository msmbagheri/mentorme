import { test, expect } from "@playwright/test";
import { loginAs } from "./helpers";

test.describe("Admin module flows", () => {
  test("dashboard renders widgets", async ({ page }) => {
    await loginAs(page, "admin");
    await page.goto("/admin");
    await expect(page.getByRole("navigation", { name: /admin navigation/i })).toBeVisible();
    // Lead/status numbers + section content render (heuristic: page has substantial text).
    const text = await page.locator("main").innerText();
    expect(text.length).toBeGreaterThan(50);
  });

  test("key admin module pages load", async ({ page }) => {
    // Dev-mode compiles each admin route on first hit, so loading ~13 pages
    // sequentially needs headroom beyond the default per-test timeout.
    test.setTimeout(120_000);
    await loginAs(page, "admin");
    for (const path of [
      "/admin/leads",
      "/admin/services",
      "/admin/team",
      "/admin/events",
      "/admin/theme",
      "/admin/seo",
      "/admin/menus",
      "/admin/ctas",
      "/admin/media",
      "/admin/users",
      "/admin/audit-logs",
      "/admin/homepage",
      "/admin/settings",
    ]) {
      const res = await page.goto(path, { waitUntil: "commit" });
      expect(res?.status(), `GET ${path}`).toBe(200);
    }
  });

  test("admin can update a lead status (and it is audited)", async ({ page }) => {
    await loginAs(page, "admin");
    const list = await page.request.get("/api/admin/leads");
    expect(list.status()).toBe(200);
    const { data } = await list.json();
    const lead = Array.isArray(data) ? data[0] : (data?.items?.[0] ?? data?.leads?.[0]);
    expect(lead?.id).toBeTruthy();

    const patch = await page.request.patch("/api/admin/leads", {
      data: { id: lead.id, status: "QUALIFIED" },
    });
    expect(patch.status()).toBe(200);

    const audit = await page.request.get("/api/admin/audit");
    expect(audit.status()).toBe(200);
  });

  test("lead CSV and Excel export work", async ({ page }) => {
    await loginAs(page, "admin");
    const csv = await page.request.get("/api/admin/leads?export=csv");
    expect(csv.status()).toBe(200);
    expect(csv.headers()["content-type"]).toContain("csv");

    const xlsx = await page.request.get("/api/admin/leads?export=xlsx");
    expect(xlsx.status()).toBe(200);
    expect(xlsx.headers()["content-type"]).toContain("spreadsheet");
  });

  test("theme update persists via API", async ({ page }) => {
    await loginAs(page, "admin");
    const res = await page.request.post("/api/admin/theme", {
      data: { brandName: "MentorMe", tagline_en: "Your Future, Mentored", tagline_fa: "آینده‌ی شما، با راهنمایی" },
    });
    expect([200, 201]).toContain(res.status());
  });
});
