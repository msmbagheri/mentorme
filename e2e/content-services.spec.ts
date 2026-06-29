import { test } from "@playwright/test";
import { expect } from "@playwright/test";
import { loginAs } from "./helpers";
import { db } from "./db";
import { runContentLifecycle, fillBilingual, fillField } from "./lib/crud";

test.describe("Services CRUD lifecycle", () => {
  test("create → edit → toggle → delete + invalid path", async ({ page }) => {
    await loginAs(page, "admin");
    const stamp = `${Date.now()}${Math.floor(Math.random() * 1000)}`;
    const slug = `e2e-service-${stamp}`;
    const titleEn = `E2E Service ${stamp}`;
    const titleEnEdited = `E2E Service ${stamp} EDITED`;

    await runContentLifecycle({
      page,
      route: "/admin/services",
      singular: "Service",
      rowText: slug,
      hasActive: true,
      publishAfterCreate: true,
      fillInvalid: async () => {
        // Leave all required fields empty → field-level Zod errors.
      },
      fillCreate: async (d) => {
        await fillField(d, "slug", slug);
        await fillBilingual(d, "title", titleEn, `سرویس ${stamp}`);
        await fillBilingual(d, "shortDescription", "Short EN", "کوتاه");
        await fillBilingual(d, "fullDescription", "Full EN", "کامل");
      },
      fillEdit: async (d) => {
        await fillBilingual(d, "title", titleEnEdited, `سرویس ${stamp} ویرایش`);
      },
      assertDbCreated: async () => {
        const row = await db.service.findUnique({ where: { slug } });
        expect(row?.title_en).toBe(titleEn);
      },
      assertDbEdited: async () => {
        const row = await db.service.findUnique({ where: { slug } });
        expect(row?.title_en).toBe(titleEnEdited);
      },
      assertDbInactive: async () => {
        const row = await db.service.findUnique({ where: { slug } });
        expect(row?.isActive).toBe(false);
      },
      assertDbGone: async () => {
        expect(await db.service.findUnique({ where: { slug } })).toBeNull();
      },
      assertPublicCreated: async () => {
        await page.goto(`/en/services/${slug}`, { waitUntil: "networkidle" });
        await expect(page.getByRole("heading", { name: titleEn })).toBeVisible({ timeout: 15_000 });
      },
      assertPublicEdited: async () => {
        await page.goto(`/en/services/${slug}`, { waitUntil: "networkidle" });
        await expect(page.getByRole("heading", { name: titleEnEdited })).toBeVisible({ timeout: 15_000 });
      },
      assertPublicHidden: async () => {
        const res = await page.goto(`/en/services/${slug}`);
        expect(res?.status(), "inactive service detail 404s").toBe(404);
      },
    });
  });
});
