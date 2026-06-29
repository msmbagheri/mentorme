import { test, expect } from "@playwright/test";
import { loginAs } from "./helpers";
import { db } from "./db";
import { runContentLifecycle, fillBilingual, fillField } from "./lib/crud";

function tag() {
  return `${Date.now()}${Math.floor(Math.random() * 1000)}`;
}

test("Case Studies CRUD lifecycle (UI+DB+public)", async ({ page }) => {
  await loginAs(page, "admin");
  const t = tag();
  const slug = `e2e-case-${t}`;
  const titleEn = `E2E Case ${t}`;
  const titleEnEdited = `E2E Case ${t} EDITED`;

  await runContentLifecycle({
    page,
    route: "/admin/case-studies",
    singular: "Case Study",
    rowText: `Student ${t}`, // name column (slug is not displayed)
    hasActive: true,
    publishAfterCreate: true,
    fillInvalid: async () => {},
    fillCreate: async (d) => {
      await fillField(d, "slug", slug);
      await fillField(d, "name", `Student ${t}`);
      await fillBilingual(d, "title", titleEn, `کیس ${t}`);
      await fillBilingual(d, "outcomeBadge", "Accepted", "پذیرفته");
      await fillBilingual(d, "story", "Story EN", "داستان");
    },
    fillEdit: async (d) => {
      await fillBilingual(d, "title", titleEnEdited, `کیس ${t} ویرایش`);
    },
    assertDbCreated: async () => expect((await db.caseStudy.findUnique({ where: { slug } }))?.title_en).toBe(titleEn),
    assertDbEdited: async () => expect((await db.caseStudy.findUnique({ where: { slug } }))?.title_en).toBe(titleEnEdited),
    assertDbInactive: async () => expect((await db.caseStudy.findUnique({ where: { slug } }))?.isActive).toBe(false),
    assertDbGone: async () => expect(await db.caseStudy.findUnique({ where: { slug } })).toBeNull(),
    assertPublicCreated: async () => {
      await page.goto(`/en/case-studies/${slug}`, { waitUntil: "networkidle" });
      await expect(page.getByText(titleEn, { exact: false }).first()).toBeVisible({ timeout: 15_000 });
    },
    assertPublicEdited: async () => {
      await page.goto(`/en/case-studies/${slug}`, { waitUntil: "networkidle" });
      await expect(page.getByText(titleEnEdited, { exact: false }).first()).toBeVisible({ timeout: 15_000 });
    },
    assertPublicHidden: async () => {
      const res = await page.goto(`/en/case-studies/${slug}`);
      expect(res?.status()).toBe(404);
    },
  });
});

test("Team Member CRUD lifecycle (UI+DB+public)", async ({ page }) => {
  await loginAs(page, "admin");
  const t = tag();
  const slug = `e2e-team-${t}`;
  const nameEn = `E2E Member ${t}`;
  const nameEnEdited = `E2E Member ${t} EDITED`;

  await runContentLifecycle({
    page,
    route: "/admin/team",
    singular: "Team Member",
    rowText: nameEn, // name column (slug not displayed)
    rowTextEdited: nameEnEdited,
    hasActive: true,
    fillInvalid: async () => {},
    fillCreate: async (d) => {
      await d.locator("#f-categoryId").selectOption({ index: 1 });
      await fillField(d, "slug", slug);
      await fillBilingual(d, "name", nameEn, `عضو ${t}`);
      await fillBilingual(d, "role", "Mentor", "منتور");
      await fillBilingual(d, "bio", "Bio EN", "بیو");
    },
    fillEdit: async (d) => {
      await fillBilingual(d, "name", nameEnEdited, `عضو ${t} ویرایش`);
    },
    assertDbCreated: async () => expect((await db.teamMember.findUnique({ where: { slug } }))?.name_en).toBe(nameEn),
    assertDbEdited: async () => expect((await db.teamMember.findUnique({ where: { slug } }))?.name_en).toBe(nameEnEdited),
    assertDbInactive: async () => expect((await db.teamMember.findUnique({ where: { slug } }))?.isActive).toBe(false),
    assertDbGone: async () => expect(await db.teamMember.findUnique({ where: { slug } })).toBeNull(),
    assertPublicCreated: async () => {
      await page.goto(`/en/team/${slug}`, { waitUntil: "networkidle" });
      await expect(page.getByText(nameEn, { exact: false }).first()).toBeVisible({ timeout: 15_000 });
    },
    assertPublicEdited: async () => {
      await page.goto(`/en/team/${slug}`, { waitUntil: "networkidle" });
      await expect(page.getByText(nameEnEdited, { exact: false }).first()).toBeVisible({ timeout: 15_000 });
    },
    assertPublicHidden: async () => {
      const res = await page.goto(`/en/team/${slug}`);
      expect(res?.status()).toBe(404);
    },
  });
});

test("Event CRUD lifecycle (UI+DB+public)", async ({ page }) => {
  await loginAs(page, "admin");
  const t = tag();
  const slug = `e2e-event-${t}`;
  const titleEn = `E2E Event ${t}`;
  const titleEnEdited = `E2E Event ${t} EDITED`;

  await runContentLifecycle({
    page,
    route: "/admin/events",
    singular: "Event",
    rowText: titleEn, // title column (slug not displayed)
    rowTextEdited: titleEnEdited,
    hasActive: false, // events use eventStatus, no isActive toggle
    publishAfterCreate: true,
    fillInvalid: async () => {},
    fillCreate: async (d) => {
      await fillField(d, "slug", slug);
      await fillBilingual(d, "title", titleEn, `رویداد ${t}`);
      await fillBilingual(d, "shortDescription", "Short EN", "کوتاه");
      await fillBilingual(d, "content", "Content EN", "محتوا");
      await d.getByRole("tab", { name: /settings/i }).click();
      await d.locator("#f-startDate").fill("2027-03-15T10:00");
      await d.getByRole("tab", { name: /content/i }).click();
    },
    fillEdit: async (d) => {
      await fillBilingual(d, "title", titleEnEdited, `رویداد ${t} ویرایش`);
    },
    assertDbCreated: async () => expect((await db.event.findUnique({ where: { slug } }))?.title_en).toBe(titleEn),
    assertDbEdited: async () => expect((await db.event.findUnique({ where: { slug } }))?.title_en).toBe(titleEnEdited),
    assertDbGone: async () => expect(await db.event.findUnique({ where: { slug } })).toBeNull(),
    assertPublicCreated: async () => {
      await page.goto(`/en/events/${slug}`, { waitUntil: "networkidle" });
      await expect(page.getByText(titleEn, { exact: false }).first()).toBeVisible({ timeout: 15_000 });
    },
    assertPublicEdited: async () => {
      await page.goto(`/en/events/${slug}`, { waitUntil: "networkidle" });
      await expect(page.getByText(titleEnEdited, { exact: false }).first()).toBeVisible({ timeout: 15_000 });
    },
  });
});

test("Page CRUD lifecycle (UI+DB; no standalone public route)", async ({ page }) => {
  await loginAs(page, "admin");
  const t = tag();
  const slug = `e2e-page-${t}`;
  const titleEn = `E2E Page ${t}`;
  const titleEnEdited = `E2E Page ${t} EDITED`;

  await runContentLifecycle({
    page,
    route: "/admin/pages",
    singular: "Page",
    rowText: slug,
    hasActive: false,
    fillInvalid: async () => {},
    fillCreate: async (d) => {
      await fillField(d, "slug", slug);
      await fillBilingual(d, "title", titleEn, `صفحه ${t}`);
    },
    fillEdit: async (d) => {
      await fillBilingual(d, "title", titleEnEdited, `صفحه ${t} ویرایش`);
    },
    assertDbCreated: async () => expect((await db.page.findUnique({ where: { slug } }))?.title_en).toBe(titleEn),
    assertDbEdited: async () => expect((await db.page.findUnique({ where: { slug } }))?.title_en).toBe(titleEnEdited),
    assertDbGone: async () => expect(await db.page.findUnique({ where: { slug } })).toBeNull(),
  });
});
