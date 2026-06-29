import { test, expect } from "@playwright/test";
import { loginAs } from "./helpers";
import { db } from "./db";

const PNG_1x1 = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
  "base64",
);

test("Media Library: upload renders thumbnail (no '?') → served → alt edit → delete", async ({ page }) => {
  await loginAs(page, "admin");
  await page.goto("/admin/media");

  const before = await db.mediaAsset.count();
  await page.locator('input[type="file"]').setInputFiles({
    name: `e2e-media-${Date.now()}.png`,
    mimeType: "image/png",
    buffer: PNG_1x1,
  });
  await expect.poll(async () => db.mediaAsset.count(), { timeout: 15_000 }).toBe(before + 1);

  const asset = await db.mediaAsset.findFirst({ orderBy: { createdAt: "desc" } });
  expect(asset?.fileUrl).toMatch(/^\/api\/media\/file\//);

  // Thumbnail renders (the served file is a real image, not a broken "?").
  const fileRes = await page.request.get(asset!.fileUrl);
  expect(fileRes.status(), "uploaded file is served").toBe(200);
  expect(fileRes.headers()["content-type"]).toContain("image");
  // The new asset's card is shown in the library.
  await expect(page.getByText(asset!.fileName).first()).toBeVisible({ timeout: 10_000 });

  // ALT edit.
  const card = page.locator("div.group").filter({ hasText: asset!.fileName }).first();
  await card.getByRole("button", { name: /^alt$/i }).click();
  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();
  await dialog.locator("#alt-en").fill("E2E alt text");
  await dialog.getByRole("button", { name: /^save$/i }).click();
  await expect(dialog).toBeHidden({ timeout: 10_000 });
  expect((await db.mediaAsset.findUnique({ where: { id: asset!.id } }))?.altText_en).toBe("E2E alt text");

  // DELETE.
  await page.locator("div.group").filter({ hasText: asset!.fileName }).first().getByRole("button", { name: /^delete$/i }).click();
  await expect.poll(async () => db.mediaAsset.findUnique({ where: { id: asset!.id } }).then((r) => r), { timeout: 8_000 }).toBeNull();
});
