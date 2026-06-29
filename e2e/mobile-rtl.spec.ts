import { test, expect } from "@playwright/test";

/**
 * Mobile + RTL + bilingual rendering. Runs on the `mobile` project (Pixel 5
 * viewport, Chromium emulation — see E2E_SUMMARY.md for the single-engine note).
 */

test("English mobile: LTR, Latin font, mobile nav works, no overflow", async ({ page }) => {
  await page.goto("/en", { waitUntil: "networkidle" });

  await expect(page.locator("html")).toHaveAttribute("dir", "ltr");
  await expect(page.locator("html")).toHaveAttribute("lang", "en");

  // Latin font is actually applied to English body text.
  const fontEn = await page.evaluate(() => getComputedStyle(document.body).fontFamily);
  expect(fontEn.toLowerCase()).toContain("inter");

  // No horizontal overflow on a phone viewport.
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  );
  expect(overflow, "no horizontal overflow on mobile").toBeLessThanOrEqual(2);

  // Mobile nav: hamburger opens the overlay menu.
  const trigger = page.locator('[aria-controls="mobile-menu"]');
  await expect(trigger).toBeVisible();
  await trigger.click();
  await expect(page.locator("#mobile-menu")).toBeVisible();
});

test("Persian mobile: RTL, Persian font, Persian content (not EN fallback)", async ({ page }) => {
  await page.goto("/fa", { waitUntil: "networkidle" });

  await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
  await expect(page.locator("html")).toHaveAttribute("lang", "fa");

  // Persian font is actually applied to fa/RTL body text.
  const fontFa = await page.evaluate(() => getComputedStyle(document.body).fontFamily);
  expect(fontFa.toLowerCase()).toContain("vazirmatn");

  // Page renders actual Persian text (Arabic-script characters present in headings).
  const h1 = (await page.locator("h1").first().textContent()) ?? "";
  expect(h1).toMatch(/[؀-ۿ]/);

  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  );
  expect(overflow, "no horizontal overflow on mobile (fa)").toBeLessThanOrEqual(2);
});

test("Bilingual: the same homepage differs between /en and /fa", async ({ page }) => {
  await page.goto("/en", { waitUntil: "networkidle" });
  const enH1 = (await page.locator("h1").first().textContent()) ?? "";
  await page.goto("/fa", { waitUntil: "networkidle" });
  const faH1 = (await page.locator("h1").first().textContent()) ?? "";
  expect(enH1.trim()).not.toBe("");
  expect(faH1.trim()).not.toBe("");
  expect(faH1).not.toBe(enH1);
});
