import { test, expect } from "@playwright/test";
import { loginAs } from "./helpers";
import { db } from "./db";
import { runContentLifecycle, fillBilingual, fillField, tab, setMediaUrl } from "./lib/crud";

function tag() {
  return `${Date.now()}${Math.floor(Math.random() * 1000)}`;
}

test("Testimonial CRUD lifecycle (UI+DB+public featured review)", async ({ page }) => {
  await loginAs(page, "admin");
  const t = tag();
  const name = `E2E Voice ${t}`;
  const quote = `E2E quote ${t}`;
  const quoteEdited = `E2E quote ${t} EDITED`;

  await runContentLifecycle({
    page,
    route: "/admin/testimonials",
    singular: "Testimonial",
    rowText: name,
    hasActive: true,
    fillInvalid: async () => {},
    fillCreate: async (d) => {
      await fillField(d, "name", name);
      await fillBilingual(d, "content", quote, "نقل قول");
      // Make it the featured review: feature it + sort to the front.
      await tab(d, /settings/i);
      await d.getByRole("switch", { name: /featured/i }).click();
      await fillField(d, "sortOrder", "-5");
    },
    fillEdit: async (d) => {
      await fillBilingual(d, "content", quoteEdited, "نقل قول ویرایش");
    },
    assertDbCreated: async () => {
      const row = await db.testimonial.findFirst({ where: { name } });
      expect(row?.content_en).toBe(quote);
      expect(row?.isFeatured).toBe(true);
    },
    assertDbEdited: async () => expect((await db.testimonial.findFirst({ where: { name } }))?.content_en).toBe(quoteEdited),
    assertDbInactive: async () => expect((await db.testimonial.findFirst({ where: { name } }))?.isActive).toBe(false),
    assertDbGone: async () => expect(await db.testimonial.findFirst({ where: { name } })).toBeNull(),
    assertPublicCreated: async () => {
      await page.goto("/en", { waitUntil: "networkidle" });
      await expect(page.getByText(quote, { exact: false })).toBeVisible({ timeout: 15_000 });
    },
    assertPublicEdited: async () => {
      await page.goto("/en", { waitUntil: "networkidle" });
      await expect(page.getByText(quoteEdited, { exact: false })).toBeVisible({ timeout: 15_000 });
    },
    assertPublicHidden: async () => {
      await page.goto("/en", { waitUntil: "networkidle" });
      await expect(page.getByText(quoteEdited, { exact: false })).toHaveCount(0);
    },
  });
});

test("As Seen In logo CRUD lifecycle (UI+DB+public)", async ({ page }) => {
  await loginAs(page, "admin");
  const t = tag();
  const title = `E2E Logo ${t}`;
  const altEn = `E2E logo alt ${t}`;
  const altEnEdited = `E2E logo alt ${t} EDITED`;

  await runContentLifecycle({
    page,
    route: "/admin/as-seen-in",
    singular: "Logo",
    rowText: title,
    hasActive: true,
    fillInvalid: async () => {
      // Leave required title + image empty → field-level errors.
    },
    fillCreate: async (d) => {
      await fillBilingual(d, "title", title, `لوگو ${t}`);
      await tab(d, /media/i);
      await setMediaUrl(d, "/uploads/avatar-1.jpg");
      await fillBilingual(d, "altText", altEn, "متن جایگزین");
      await tab(d, /settings/i);
      await fillField(d, "sortOrder", "-5");
    },
    fillEdit: async (d) => {
      await tab(d, /media/i);
      await fillBilingual(d, "altText", altEnEdited, "متن ویرایش");
    },
    assertDbCreated: async () => expect((await db.asSeenInLogo.findFirst({ where: { title_en: title } }))?.altText_en).toBe(altEn),
    assertDbEdited: async () => expect((await db.asSeenInLogo.findFirst({ where: { title_en: title } }))?.altText_en).toBe(altEnEdited),
    assertDbInactive: async () => expect((await db.asSeenInLogo.findFirst({ where: { title_en: title } }))?.isActive).toBe(false),
    assertDbGone: async () => expect(await db.asSeenInLogo.findFirst({ where: { title_en: title } })).toBeNull(),
    assertPublicCreated: async () => {
      await page.goto("/en", { waitUntil: "networkidle" });
      await expect(page.getByRole("img", { name: altEn })).toBeVisible({ timeout: 15_000 });
    },
    assertPublicEdited: async () => {
      await page.goto("/en", { waitUntil: "networkidle" });
      await expect(page.getByRole("img", { name: altEnEdited })).toBeVisible({ timeout: 15_000 });
    },
    assertPublicHidden: async () => {
      await page.goto("/en", { waitUntil: "networkidle" });
      await expect(page.getByRole("img", { name: altEnEdited })).toHaveCount(0);
    },
  });
});

test("Methodology Step CRUD lifecycle (UI+DB+public)", async ({ page }) => {
  await loginAs(page, "admin");
  const t = tag();
  const titleEn = `E2E Step ${t}`;
  const descEn = `E2E step desc ${t}`;
  const descEnEdited = `E2E step desc ${t} EDITED`;

  await runContentLifecycle({
    page,
    route: "/admin/methodology",
    singular: "Methodology Step",
    rowText: titleEn,
    hasActive: true,
    fillInvalid: async () => {},
    fillCreate: async (d) => {
      await fillField(d, "stepNumber", "9");
      await fillBilingual(d, "title", titleEn, `گام ${t}`);
      await fillBilingual(d, "description", descEn, "توضیح");
      await tab(d, /settings/i);
      await fillField(d, "sortOrder", "-5");
    },
    fillEdit: async (d) => {
      await fillBilingual(d, "description", descEnEdited, "توضیح ویرایش");
    },
    assertDbCreated: async () => expect((await db.methodologyStep.findFirst({ where: { title_en: titleEn } }))?.description_en).toBe(descEn),
    assertDbEdited: async () => expect((await db.methodologyStep.findFirst({ where: { title_en: titleEn } }))?.description_en).toBe(descEnEdited),
    assertDbInactive: async () => expect((await db.methodologyStep.findFirst({ where: { title_en: titleEn } }))?.isActive).toBe(false),
    assertDbGone: async () => expect(await db.methodologyStep.findFirst({ where: { title_en: titleEn } })).toBeNull(),
    assertPublicCreated: async () => {
      await page.goto("/en", { waitUntil: "networkidle" });
      await expect(page.getByText(titleEn, { exact: false })).toBeVisible({ timeout: 15_000 });
    },
    assertPublicEdited: async () => {
      await page.goto("/en", { waitUntil: "networkidle" });
      await expect(page.getByText(descEnEdited, { exact: false })).toBeVisible({ timeout: 15_000 });
    },
    assertPublicHidden: async () => {
      await page.goto("/en", { waitUntil: "networkidle" });
      await expect(page.getByText(titleEn, { exact: false })).toHaveCount(0);
    },
  });
});

test("Value Proposition CRUD lifecycle (UI+DB+public)", async ({ page }) => {
  await loginAs(page, "admin");
  const t = tag();
  const titleEn = `E2E Value ${t}`;
  const descEn = `E2E value desc ${t}`;
  const descEnEdited = `E2E value desc ${t} EDITED`;

  await runContentLifecycle({
    page,
    route: "/admin/value-props",
    singular: "Value Proposition",
    rowText: titleEn,
    hasActive: true,
    fillInvalid: async () => {},
    fillCreate: async (d) => {
      await fillBilingual(d, "title", titleEn, `ارزش ${t}`);
      await fillBilingual(d, "description", descEn, "توضیح");
      await tab(d, /settings/i);
      await fillField(d, "sortOrder", "-5");
    },
    fillEdit: async (d) => {
      await fillBilingual(d, "description", descEnEdited, "توضیح ویرایش");
    },
    assertDbCreated: async () => expect((await db.valueProposition.findFirst({ where: { title_en: titleEn } }))?.description_en).toBe(descEn),
    assertDbEdited: async () => expect((await db.valueProposition.findFirst({ where: { title_en: titleEn } }))?.description_en).toBe(descEnEdited),
    assertDbInactive: async () => expect((await db.valueProposition.findFirst({ where: { title_en: titleEn } }))?.isActive).toBe(false),
    assertDbGone: async () => expect(await db.valueProposition.findFirst({ where: { title_en: titleEn } })).toBeNull(),
    assertPublicCreated: async () => {
      await page.goto("/en", { waitUntil: "networkidle" });
      await expect(page.getByText(titleEn, { exact: false })).toBeVisible({ timeout: 15_000 });
    },
    assertPublicEdited: async () => {
      await page.goto("/en", { waitUntil: "networkidle" });
      await expect(page.getByText(descEnEdited, { exact: false })).toBeVisible({ timeout: 15_000 });
    },
    assertPublicHidden: async () => {
      await page.goto("/en", { waitUntil: "networkidle" });
      await expect(page.getByText(titleEn, { exact: false })).toHaveCount(0);
    },
  });
});

test("Success Metric CRUD lifecycle (UI+DB; not rendered as a public section)", async ({ page }) => {
  await loginAs(page, "admin");
  const t = tag();
  const value = `${t.slice(-4)}%`;
  const labelEn = `E2E Metric ${t}`;
  const labelEnEdited = `E2E Metric ${t} EDITED`;

  await runContentLifecycle({
    page,
    route: "/admin/success-metrics",
    singular: "Success Metric",
    rowText: labelEn,
    rowTextEdited: labelEnEdited,
    hasActive: true,
    fillInvalid: async () => {},
    fillCreate: async (d) => {
      await fillField(d, "metricValue", value);
      await fillBilingual(d, "metricLabel", labelEn, `معیار ${t}`);
    },
    fillEdit: async (d) => {
      await fillBilingual(d, "metricLabel", labelEnEdited, `معیار ${t} ویرایش`);
    },
    assertDbCreated: async () => expect((await db.successMetric.findFirst({ where: { metricLabel_en: labelEn } }))?.metricValue).toBe(value),
    assertDbEdited: async () => expect((await db.successMetric.findFirst({ where: { metricLabel_en: labelEnEdited } }))?.metricValue).toBe(value),
    assertDbInactive: async () => expect((await db.successMetric.findFirst({ where: { metricLabel_en: labelEnEdited } }))?.isActive).toBe(false),
    assertDbGone: async () => expect(await db.successMetric.findFirst({ where: { metricLabel_en: labelEnEdited } })).toBeNull(),
  });
});
