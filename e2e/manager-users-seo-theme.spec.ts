import { test, expect } from "@playwright/test";
import { loginAs, fillCaptcha, CREDENTIALS } from "./helpers";
import { db } from "./db";

function tag() {
  return `${Date.now()}${Math.floor(Math.random() * 1000)}`;
}

test("User Manager: create (can log in) → edit role → deactivate", async ({ page, browser }) => {
  await loginAs(page, "admin");
  const t = tag();
  const email = `e2e.user.${t}@example.com`;
  const password = "E2eUserPass123!";

  await page.goto("/admin/users");
  await page.getByRole("button", { name: /new user/i }).click();
  let dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();
  await dialog.locator("#u-name").fill(`E2E User ${t}`);
  await dialog.locator("#u-email").fill(email);
  await dialog.locator("#u-pass").fill(password);
  await dialog.locator("#u-role").selectOption("EDITOR");
  await dialog.getByRole("button", { name: /^save$/i }).click();
  await expect(dialog).toBeHidden({ timeout: 10_000 });

  // DB: user exists with a real password hash.
  const user = await db.user.findUnique({ where: { email } });
  expect(user?.role).toBe("EDITOR");
  expect(user?.passwordHash?.length).toBeGreaterThan(20);

  // The hashed password actually works — log in as the new user in a fresh context.
  const ctx = await browser.newContext();
  const p2 = await ctx.newPage();
  await p2.goto("/admin/login");
  await p2.fill("#email", email);
  await p2.fill("#password", password);
  await fillCaptcha(p2);
  await p2.getByRole("button", { name: /sign in/i }).click();
  await expect(p2).toHaveURL(/\/admin(\/|$)(?!login)/, { timeout: 15_000 });
  await ctx.close();

  // EDIT role → VIEWER.
  await page.goto("/admin/users");
  await page.locator("tr").filter({ hasText: email }).getByRole("button", { name: /edit user/i }).click();
  dialog = page.getByRole("dialog");
  await dialog.locator("#u-role").selectOption("VIEWER");
  await dialog.getByRole("button", { name: /^save$/i }).click();
  await expect(dialog).toBeHidden({ timeout: 10_000 });
  expect((await db.user.findUnique({ where: { email } }))?.role).toBe("VIEWER");

  // DEACTIVATE.
  await page.locator("tr").filter({ hasText: email }).getByRole("button", { name: /deactivate user/i }).click();
  await expect.poll(async () => (await db.user.findUnique({ where: { email } }))?.isActive, { timeout: 8_000 }).toBe(false);

  // Cleanup.
  await db.user.delete({ where: { email } });
  void CREDENTIALS;
});

test("SEO Manager: edit home page meta → reflected in <head>", async ({ page }) => {
  await loginAs(page, "admin");
  const t = tag();
  const metaTitle = `E2E Meta ${t}`;
  const home = await db.page.findUnique({ where: { slug: "home" }, select: { id: true, title_en: true } });
  const seoBefore = await db.seoSetting.findUnique({ where: { pageId: home!.id } });

  try {
    await page.goto("/admin/seo");
    await page.locator("#seo-page").selectOption(home!.id);
    await page.locator("#mt-en").fill(metaTitle);
    await page.getByRole("button", { name: /^save$/i }).click();
    await expect(page.getByText(/SEO saved/i).first()).toBeVisible({ timeout: 10_000 });

    expect((await db.seoSetting.findUnique({ where: { pageId: home!.id } }))?.metaTitle_en).toBe(metaTitle);

    await page.goto("/en", { waitUntil: "networkidle" });
    await expect.poll(async () => page.title(), { timeout: 15_000 }).toContain(metaTitle);
  } finally {
    if (seoBefore) {
      await db.seoSetting.update({ where: { pageId: home!.id }, data: { metaTitle_en: seoBefore.metaTitle_en } });
    } else {
      await db.seoSetting.deleteMany({ where: { pageId: home!.id, metaTitle_en: metaTitle } });
    }
  }
});

test("Theme Manager: edit color + Persian font → reflected on public site", async ({ page }) => {
  await loginAs(page, "admin");
  const color = "#123abc";
  const before = await db.themeSetting.findFirst();

  try {
    await page.goto("/admin/theme");
    // Set the color via the paired hex text input (the native <input type=color>
    // doesn't reliably fire React's onChange under Playwright); this Input shares
    // the same state value and fill() triggers onChange normally.
    await page.getByLabel("Primary", { exact: true }).fill(color);
    await page.locator("#font-fa").fill("Vazirmatn");
    await page.getByRole("button", { name: /^save$/i }).click();
    await expect(page.getByText(/Theme saved/i).first()).toBeVisible({ timeout: 10_000 });

    await page.goto("/en", { waitUntil: "networkidle" });
    const style = await page.locator("#mentorme-theme").textContent();
    expect(style).toContain(`--brand-primary:${color}`);
    expect(style).toContain("Vazirmatn");
  } finally {
    if (before) {
      await db.themeSetting.update({
        where: { id: before.id },
        data: { primaryColor: before.primaryColor, fontFamilyPersian: before.fontFamilyPersian },
      });
    }
  }
});
