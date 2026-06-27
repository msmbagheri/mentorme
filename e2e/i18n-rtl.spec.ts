import { test, expect } from "@playwright/test";

test.describe("Internationalization (EN/FA) + RTL", () => {
  test("English page is LTR", async ({ page }) => {
    await page.goto("/en");
    await expect(page.locator("html")).toHaveAttribute("dir", "ltr");
    await expect(page.locator("html")).toHaveAttribute("lang", "en");
  });

  test("Persian page is RTL", async ({ page }) => {
    await page.goto("/fa");
    await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
    await expect(page.locator("html")).toHaveAttribute("lang", "fa");
  });

  test("Persian homepage renders Persian content (not English fallback)", async ({
    page,
  }) => {
    await page.goto("/fa");
    // Body should contain Persian characters.
    const text = await page.locator("main").innerText();
    expect(/[؀-ۿ]/.test(text)).toBe(true);
  });

  test("locale switcher toggles EN <-> FA", async ({ page }) => {
    await page.goto("/en");
    // The switcher is a <button> with a Persian aria-label on the EN page.
    const toFa = page.getByRole("button", { name: "تغییر زبان به فارسی" }).first();
    await expect(toFa).toBeVisible();
    await toFa.click();
    await expect(page).toHaveURL(/\/fa(\/|$)/);
    await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
  });
});
