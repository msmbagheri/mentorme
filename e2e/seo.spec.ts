import { test, expect } from "@playwright/test";

test.describe("SEO", () => {
  test("homepage has title, description and canonical/alternate", async ({ page }) => {
    await page.goto("/en");
    await expect(page).toHaveTitle(/MentorMe/);
    const desc = page.locator('meta[name="description"]');
    await expect(desc).toHaveAttribute("content", /.+/);
    await expect(page.locator('link[rel="canonical"]')).toHaveCount(1);
    // hreflang alternates for en + fa.
    expect(await page.locator('link[rel="alternate"]').count()).toBeGreaterThan(0);
  });

  test("homepage emits Organization + FAQ JSON-LD", async ({ page }) => {
    await page.goto("/en");
    const blocks = await page
      .locator('script[type="application/ld+json"]')
      .allTextContents();
    const joined = blocks.join(" ");
    expect(joined).toContain("Organization");
    expect(joined).toContain("FAQPage");
  });

  test("robots.txt disallows admin", async ({ request }) => {
    const res = await request.get("/robots.txt");
    expect(res.status()).toBe(200);
    const body = await res.text();
    expect(body).toMatch(/Disallow:\s*\/admin/);
  });

  test("sitemap.xml lists localized URLs", async ({ request }) => {
    const res = await request.get("/sitemap.xml");
    expect(res.status()).toBe(200);
    const body = await res.text();
    expect(body).toContain("/en");
    expect(body).toContain("/fa");
    expect(body).toContain("/services/");
  });

  test("OpenGraph tags are present", async ({ page }) => {
    await page.goto("/en");
    await expect(page.locator('meta[property="og:title"]')).toHaveCount(1);
    await expect(page.locator('meta[property="og:type"]')).toHaveCount(1);
  });
});
