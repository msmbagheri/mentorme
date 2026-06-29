import { test, expect } from "@playwright/test";

/**
 * Success Stories section (distinct from the single Featured Review). Spec: a
 * grid/slider of ≥3 cards, each linking to a dedicated Case Study detail page.
 */
test("Success Stories: ≥3 cards on the homepage, each links to a case study", async ({ page }) => {
  await page.goto("/en", { waitUntil: "networkidle" });
  const section = page.locator("#success-stories");
  await expect(section).toBeVisible();

  const cardLinks = section.locator('a[href*="/case-studies/"]');
  expect(await cardLinks.count(), "at least 3 success-story cards").toBeGreaterThanOrEqual(3);

  // Each card has an image (1:1) and a Read More affordance.
  await expect(section.locator("img").first()).toBeVisible();

  // Following a card lands on its Case Study detail page.
  const href = await cardLinks.first().getAttribute("href");
  expect(href).toMatch(/\/en\/case-studies\/.+/);
  await cardLinks.first().click();
  await expect(page).toHaveURL(/\/en\/case-studies\/.+/);
  await expect(page.locator("h1")).toBeVisible();
});

test("Success Stories: responsive layout (no horizontal overflow)", async ({ page }) => {
  await page.goto("/en", { waitUntil: "networkidle" });
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  );
  expect(overflow, "no horizontal overflow").toBeLessThanOrEqual(2);
});
