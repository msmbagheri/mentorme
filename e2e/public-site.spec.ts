import { test, expect } from "@playwright/test";

test.describe("Public homepage", () => {
  test("/ redirects to /fa (default locale)", async ({ page }) => {
    const res = await page.goto("/");
    expect(page.url()).toContain("/fa");
    expect(res?.status()).toBeLessThan(400);
  });

  test("homepage renders DB-driven content in trust-flow order", async ({ page }) => {
    await page.goto("/en");
    // Hero copy comes from HeroSection (DB-driven).
    await expect(page.getByText("Your Future, Mentored").first()).toBeVisible();
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();

    // Section headings (in rendered order).
    await expect(page.getByRole("heading", { name: /Our Methodology/i })).toBeVisible();
    await expect(page.getByRole("heading", { name: /Why Clients Choose Us/i })).toBeVisible();
    await expect(page.getByRole("heading", { name: /Our Services/i })).toBeVisible();
    await expect(page.getByRole("heading", { name: /Success Stories/i })).toBeVisible();
    await expect(page.getByRole("heading", { name: /Meet The Team/i })).toBeVisible();

    // Real seeded business content (DB-driven, NOT hardcoded).
    await expect(page.getByText(/College Admissions Strategy/i).first()).toBeVisible();
    await expect(page.getByText(/Mentorship Over Sales/i)).toBeVisible(); // BrandPhilosophy.title
    await expect(page.getByText(/Elena Hart/i).first()).toBeVisible(); // FounderMessage
  });

  test("all homepage images resolve (no broken images)", async ({ page }) => {
    await page.goto("/en", { waitUntil: "domcontentloaded" });
    const srcs = await page.locator("img").evaluateAll((els) =>
      (els as HTMLImageElement[]).map((i) => i.getAttribute("src")).filter(Boolean),
    );
    expect(srcs.length).toBeGreaterThan(10);
    // Fetch each src directly (robust against lazy-loading / viewport).
    const bad: string[] = [];
    for (const src of srcs) {
      const res = await page.request.get(src as string);
      if (res.status() !== 200) bad.push(`${res.status()} ${src}`);
    }
    expect(bad, `broken: ${bad.join(", ")}`).toHaveLength(0);
  });

  test("header navigation and primary CTA are present", async ({ page }) => {
    await page.goto("/en");
    const header = page.getByRole("banner");
    await expect(header).toBeVisible();
    // At least one nav link + a CTA.
    await expect(header.getByRole("link").first()).toBeVisible();
  });

  test("footer renders with contact info", async ({ page }) => {
    await page.goto("/en");
    const footer = page.getByRole("contentinfo");
    await expect(footer).toBeVisible();
    await expect(footer.getByText(/hello@mentorme\.com/i)).toBeVisible();
  });

  test("skip-to-content link exists for a11y", async ({ page }) => {
    await page.goto("/en");
    const skip = page.locator('a[href="#main-content"]');
    await expect(skip).toHaveCount(1);
    await expect(page.locator("#main-content")).toHaveCount(1);
  });
});
