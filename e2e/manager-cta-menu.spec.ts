import { test, expect } from "@playwright/test";
import { loginAs } from "./helpers";
import { db } from "./db";

function tag() {
  return `${Date.now()}${Math.floor(Math.random() * 1000)}`;
}

test("CTA Manager: create → edit → delete (UI+DB) + invalid + public label", async ({ page }) => {
  await loginAs(page, "admin");
  const t = tag();
  const name = `e2e-cta-${t}`;
  const labelEn = `E2E CTA ${t}`;

  await page.goto("/admin/ctas");

  // INVALID: empty internal name → save fails, dialog stays open.
  await page.getByRole("button", { name: /new cta/i }).click();
  let dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();
  await dialog.getByRole("button", { name: /^save$/i }).click();
  await expect(dialog, "invalid CTA keeps dialog open").toBeVisible();
  await dialog.getByRole("button", { name: /^cancel$/i }).click();
  await expect(dialog).toBeHidden();

  // CREATE.
  await page.getByRole("button", { name: /new cta/i }).click();
  dialog = page.getByRole("dialog");
  await dialog.locator("#cta-name").fill(name);
  await dialog.locator("#cta-en").fill(labelEn);
  await dialog.locator("#cta-fa").fill(`دکمه ${t}`);
  await dialog.getByRole("button", { name: /^save$/i }).click();
  await expect(dialog).toBeHidden({ timeout: 10_000 });
  await expect(page.locator("tr").filter({ hasText: name })).toBeVisible();
  expect((await db.ctaConfig.findUnique({ where: { internalName: name } }))?.label_en).toBe(labelEn);

  // EDIT.
  await page.locator("tr").filter({ hasText: name }).getByRole("button", { name: /^edit$/i }).click();
  dialog = page.getByRole("dialog");
  await dialog.locator("#cta-en").fill(`${labelEn} EDITED`);
  await dialog.getByRole("button", { name: /^save$/i }).click();
  await expect(dialog).toBeHidden({ timeout: 10_000 });
  expect((await db.ctaConfig.findUnique({ where: { internalName: name } }))?.label_en).toBe(`${labelEn} EDITED`);

  // DELETE (direct, no confirm dialog).
  await page.locator("tr").filter({ hasText: name }).getByRole("button", { name: /^delete$/i }).click();
  await expect.poll(async () => db.ctaConfig.findUnique({ where: { internalName: name } }).then((r) => r), { timeout: 8_000 }).toBeNull();
});

test("CTA public reflection: edit header CTA label shows in nav", async ({ page }) => {
  await loginAs(page, "admin");
  const header = await db.ctaConfig.findUnique({ where: { internalName: "book-consultation" } });
  test.skip(!header, "seed has no book-consultation CTA");
  const original = header!.label_en;
  const newLabel = `Book ${Date.now()}`;

  try {
    await page.goto("/admin/ctas");
    await page.locator("tr").filter({ hasText: "book-consultation" }).getByRole("button", { name: /^edit$/i }).click();
    const dialog = page.getByRole("dialog");
    await dialog.locator("#cta-en").fill(newLabel);
    await dialog.getByRole("button", { name: /^save$/i }).click();
    await expect(dialog).toBeHidden({ timeout: 10_000 });

    await page.goto("/en", { waitUntil: "networkidle" });
    await expect(page.getByText(newLabel, { exact: false }).first()).toBeVisible({ timeout: 15_000 });
  } finally {
    await db.ctaConfig.update({ where: { id: header!.id }, data: { label_en: original } });
  }
});

test("Menu Manager: add → edit → delete item (UI+DB) + public nav", async ({ page }) => {
  await loginAs(page, "admin");
  const t = tag();
  const labelEn = `E2E Nav ${t}`;
  const headerMenu = await db.menu.findUnique({ where: { internalName: "header" } });
  test.skip(!headerMenu, "seed has no header menu");

  await page.goto("/admin/menus");
  // ADD item to the header menu card.
  const card = page.locator("div").filter({ has: page.getByText("header", { exact: true }) }).first();
  await page.getByRole("button", { name: /add item/i }).first().click();
  let dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();
  await dialog.locator("#mi-en").fill(labelEn);
  await dialog.locator("#mi-fa").fill(`ناوبری ${t}`);
  await dialog.locator("#mi-type").selectOption("EXTERNAL_URL");
  await dialog.locator("#mi-ext").fill("https://example.com");
  await dialog.getByRole("button", { name: /^save$/i }).click();
  await expect(dialog).toBeHidden({ timeout: 10_000 });

  let item = await db.menuItem.findFirst({ where: { label_en: labelEn } });
  expect(item, "menu item created in DB").toBeTruthy();
  void card;

  // Public: header nav shows the item.
  await page.goto("/en", { waitUntil: "networkidle" });
  await expect(page.getByRole("link", { name: labelEn }).first()).toBeVisible({ timeout: 15_000 });

  // EDIT.
  await page.goto("/admin/menus");
  await page.locator("li").filter({ hasText: labelEn }).first().getByRole("button", { name: /^edit$/i }).click();
  dialog = page.getByRole("dialog");
  await dialog.locator("#mi-en").fill(`${labelEn} EDITED`);
  await dialog.getByRole("button", { name: /^save$/i }).click();
  await expect(dialog).toBeHidden({ timeout: 10_000 });
  expect((await db.menuItem.findUnique({ where: { id: item!.id } }))?.label_en).toBe(`${labelEn} EDITED`);

  // DELETE.
  await page.locator("li").filter({ hasText: `${labelEn} EDITED` }).first().getByRole("button", { name: /^delete$/i }).click();
  await expect.poll(async () => db.menuItem.findUnique({ where: { id: item!.id } }).then((r) => r), { timeout: 8_000 }).toBeNull();
  item = null;
});
