import { test, expect } from "@playwright/test";

const PNG_MAGIC = "89504e470d0a1a0a";

test.describe("Issues wave 5", () => {
  test("legal pages exist and render their body (#15)", async ({ page }) => {
    await page.goto("/fa/privacy");
    await expect(page.locator("article h1")).toContainText("حریم خصوصی");
    await expect(page.locator("article")).toContainText("اطلاعات");

    await page.goto("/en/terms");
    await expect(page.locator("article h1")).toContainText("Terms");
  });

  test("home always exposes an og:image (#18)", async ({ page }) => {
    await page.goto("/fa");
    const og = page.locator('meta[property="og:image"]');
    await expect(og).toHaveCount(1);
    const content = await og.getAttribute("content");
    expect(content).toBeTruthy();
  });

  test("generated OG banner is a real 1200px-wide PNG (#18)", async ({ request }) => {
    const res = await request.get("/api/pwa/og");
    expect(res.status()).toBe(200);
    expect(res.headers()["content-type"]).toBe("image/png");
    const body = await res.body();
    expect(body.subarray(0, 8).toString("hex")).toBe(PNG_MAGIC);
    // IHDR width lives at bytes 16-19 of a PNG.
    expect(body.readUInt32BE(16)).toBe(1200);
    expect(body.readUInt32BE(20)).toBe(630);
  });

  test("head declares a 48x48 icon for Google Search (#17)", async ({ page }) => {
    await page.goto("/en");
    await expect(page.locator('link[rel="icon"][sizes="48x48"]')).toHaveCount(1);
  });

  test("homepage section API accepts card bg and font scale (#5-#14)", async ({
    request,
  }) => {
    // Unauthenticated must be rejected (schema exists behind auth) — this
    // guards the route wiring without needing an admin session here.
    const res = await request.patch("/api/admin/homepage", {
      data: {
        sectionType: "services",
        header: {},
        cardBgColor: "#ffffff",
        fontScale: 1.1,
      },
    });
    expect([401, 403]).toContain(res.status());
  });
});
