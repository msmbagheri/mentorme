import { test, expect, type Page, type Locator } from "@playwright/test";
import { loginAs } from "./helpers";
import { db } from "./db";
import { fillBilingual } from "./lib/crud";

/** Open a homepage singleton section's editor from the Homepage Builder. */
async function openSingleton(page: Page, sectionLabel: string): Promise<Locator> {
  await page.goto("/admin/homepage");
  const row = page.getByRole("listitem").filter({ hasText: sectionLabel }).first();
  await row.getByRole("button", { name: /edit content/i }).click();
  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();
  return dialog;
}

async function saveDialog(dialog: Locator) {
  await dialog.getByRole("button", { name: /^save$/i }).click();
  await expect(dialog).toBeHidden({ timeout: 10_000 });
}

test("Hero singleton: edit (UI+DB+public) + invalid path", async ({ page }) => {
  await loginAs(page, "admin");
  const t = `${Date.now()}`;
  const headline = `E2E Hero ${t}`;
  const hero = await db.heroSection.findFirst();
  const original = hero!.headline_en;

  try {
    // Invalid: clear required headline → field error.
    let d = await openSingleton(page, "Hero");
    await d.locator("#headline_en").fill("");
    await d.getByRole("button", { name: /^save$/i }).click();
    await expect(d.getByTestId("form-errors")).toBeVisible({ timeout: 10_000 });
    await d.getByRole("button", { name: /^cancel$/i }).click();

    // Edit.
    d = await openSingleton(page, "Hero");
    await d.locator("#headline_en").fill(headline);
    await saveDialog(d);

    expect((await db.heroSection.findFirst())?.headline_en).toBe(headline);
    await page.goto("/en", { waitUntil: "networkidle" });
    await expect(page.locator("h1")).toContainText(headline, { timeout: 15_000 });
  } finally {
    await db.heroSection.update({ where: { id: hero!.id }, data: { headline_en: original } });
  }
});

test("Brand Philosophy singleton: edit (UI+DB+public)", async ({ page }) => {
  await loginAs(page, "admin");
  const t = `${Date.now()}`;
  const title = `E2E Brand ${t}`;
  const row = await db.brandPhilosophy.findFirst();
  const original = row!.title_en;
  try {
    const d = await openSingleton(page, "Brand Philosophy");
    await d.locator("#title_en").fill(title);
    await saveDialog(d);
    expect((await db.brandPhilosophy.findFirst())?.title_en).toBe(title);
    await page.goto("/en", { waitUntil: "networkidle" });
    await expect(page.getByText(title, { exact: false })).toBeVisible({ timeout: 15_000 });
  } finally {
    await db.brandPhilosophy.update({ where: { id: row!.id }, data: { title_en: original } });
  }
});

test("Founder Message singleton: edit (UI+DB+public)", async ({ page }) => {
  await loginAs(page, "admin");
  const t = `${Date.now()}`;
  const name = `E2E Founder ${t}`;
  const row = await db.founderMessage.findFirst();
  const original = row!.name_en;
  try {
    const d = await openSingleton(page, "Founder Message");
    await d.locator("#name_en").fill(name);
    await saveDialog(d);
    expect((await db.founderMessage.findFirst())?.name_en).toBe(name);
    await page.goto("/en", { waitUntil: "networkidle" });
    await expect(page.getByText(name, { exact: false })).toBeVisible({ timeout: 15_000 });
  } finally {
    await db.founderMessage.update({ where: { id: row!.id }, data: { name_en: original } });
  }
});

test("Final CTA singleton: edit (UI+DB+public)", async ({ page }) => {
  await loginAs(page, "admin");
  const t = `${Date.now()}`;
  const headline = `E2E Final ${t}`;
  const row = await db.finalCta.findFirst();
  const original = row!.headline_en;
  try {
    const d = await openSingleton(page, "Final CTA");
    await d.locator("#headline_en").fill(headline);
    await saveDialog(d);
    expect((await db.finalCta.findFirst())?.headline_en).toBe(headline);
    await page.goto("/en", { waitUntil: "networkidle" });
    await expect(page.getByText(headline, { exact: false })).toBeVisible({ timeout: 15_000 });
  } finally {
    await db.finalCta.update({ where: { id: row!.id }, data: { headline_en: original } });
  }
});
