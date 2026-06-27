import { test, expect } from "@playwright/test";

const PAGES = [
  { url: "/en/services/college-admissions-strategy", needle: /College Admissions Strategy/i },
  { url: "/en/case-studies/aria-n-stanford", needle: /Stanford/i },
  { url: "/en/team/elena-hart", needle: /Elena Hart/i },
  { url: "/en/events/college-essay-workshop", needle: /Essay/i },
  { url: "/en/contact", needle: /Consultation|Contact/i },
];

test.describe("Detail pages", () => {
  for (const p of PAGES) {
    test(`renders ${p.url}`, async ({ page }) => {
      const res = await page.goto(p.url);
      expect(res?.status()).toBe(200);
      await expect(page.getByText(p.needle).first()).toBeVisible();
      await expect(page.getByRole("contentinfo")).toBeVisible(); // footer present
    });
  }

  test("unknown slug returns a 404 page", async ({ page }) => {
    const res = await page.goto("/en/services/this-does-not-exist");
    expect(res?.status()).toBe(404);
  });

  test("detail pages emit JSON-LD structured data", async ({ page }) => {
    await page.goto("/en/services/college-admissions-strategy");
    const ld = page.locator('script[type="application/ld+json"]');
    expect(await ld.count()).toBeGreaterThan(0);
    const json = await ld.first().textContent();
    expect(json).toContain("@type");
  });

  test("Persian detail page renders RTL", async ({ page }) => {
    const res = await page.goto("/fa/services/college-admissions-strategy");
    expect(res?.status()).toBe(200);
    await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
  });
});
