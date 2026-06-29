import { type Page, type Locator, expect } from "@playwright/test";

/**
 * Drives the full admin lifecycle for a ContentList-based module through the REAL
 * browser UI, asserting all three layers at each mutation:
 *   (a) UI confirms success (dialog closes / row appears or disappears)
 *   (b) the DB row actually changed (caller-supplied Prisma assertions)
 *   (c) the public site reflects the change after revalidation (optional)
 * Plus the invalid-input path: a bad create shows field-level Zod errors.
 */
export interface ContentLifecycleSpec {
  page: Page;
  route: string; // e.g. "/admin/services"
  singular: string; // e.g. "Service" — used for the New/Edit/Delete button labels
  rowText: string; // unique text shown in a list column for the created row
  rowTextEdited?: string; // identifying text after edit, if it changes
  hasActive?: boolean; // module exposes an Active toggle
  publishAfterCreate?: boolean; // workflow entity — publish so it surfaces publicly
  fillCreate: (dialog: Locator) => Promise<void>;
  fillEdit: (dialog: Locator) => Promise<void>;
  fillInvalid?: (dialog: Locator) => Promise<void>;
  assertDbCreated: () => Promise<void>;
  assertDbEdited: () => Promise<void>;
  assertDbGone: () => Promise<void>;
  assertDbInactive?: () => Promise<void>;
  assertPublicCreated?: () => Promise<void>;
  assertPublicEdited?: () => Promise<void>;
  assertPublicHidden?: () => Promise<void>;
}

const SAVE = /^save$/i;

export async function openNew(page: Page, singular: string): Promise<Locator> {
  await page.getByRole("button", { name: new RegExp(`New ${escape(singular)}`, "i") }).first().click();
  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();
  return dialog;
}

function escape(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function rowFor(page: Page, text: string): Locator {
  return page.locator("tr").filter({ hasText: text }).first();
}

export async function runContentLifecycle(s: ContentLifecycleSpec) {
  const { page, singular } = s;

  // ---- INVALID INPUT PATH: a bad create surfaces field-level Zod errors ----
  if (s.fillInvalid) {
    await page.goto(s.route);
    const dialog = await openNew(page, singular);
    await s.fillInvalid(dialog);
    await dialog.getByRole("button", { name: SAVE }).click();
    await expect(dialog.getByTestId("form-errors"), "field-level errors shown").toBeVisible({
      timeout: 10_000,
    });
    await expect(dialog, "dialog stays open on invalid save").toBeVisible();
    // Close without saving.
    await dialog.getByRole("button", { name: /^cancel$/i }).click();
    await expect(dialog).toBeHidden();
  }

  // ---- CREATE ----
  await page.goto(s.route);
  let dialog = await openNew(page, singular);
  await s.fillCreate(dialog);
  await dialog.getByRole("button", { name: SAVE }).click();
  await expect(dialog, "dialog closes on successful create").toBeHidden({ timeout: 10_000 });
  await expect(rowFor(page, s.rowText), "new row appears in list (UI)").toBeVisible({ timeout: 10_000 });
  await s.assertDbCreated();

  // ---- PUBLISH (workflow entities only) so the record surfaces publicly ----
  if (s.publishAfterCreate) {
    await page.goto(s.route);
    await rowFor(page, s.rowText)
      .getByRole("button", { name: new RegExp(`Edit ${escape(singular)}`, "i") })
      .click();
    dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    await dialog.getByRole("button", { name: /^publish$/i }).click();
    await expect(dialog).toBeHidden({ timeout: 10_000 });
  }
  if (s.assertPublicCreated) await s.assertPublicCreated();

  // ---- EDIT ----
  await page.goto(s.route);
  await rowFor(page, s.rowText)
    .getByRole("button", { name: new RegExp(`Edit ${escape(singular)}`, "i") })
    .click();
  dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();
  await s.fillEdit(dialog);
  await dialog.getByRole("button", { name: SAVE }).click();
  await expect(dialog).toBeHidden({ timeout: 10_000 });
  await s.assertDbEdited();
  if (s.assertPublicEdited) await s.assertPublicEdited();

  // ---- TOGGLE isActive OFF ----
  if (s.hasActive) {
    await page.goto(s.route);
    const text = s.rowTextEdited ?? s.rowText;
    const sw = rowFor(page, text).getByRole("switch", { name: /toggle active/i });
    await expect(sw).toHaveAttribute("aria-checked", "true");
    await sw.click();
    await expect(sw, "active switch flips off in UI").toHaveAttribute("aria-checked", "false");
    if (s.assertDbInactive) await s.assertDbInactive();
    if (s.assertPublicHidden) await s.assertPublicHidden();
  }

  // ---- DELETE ----
  await page.goto(s.route);
  const finalText = s.rowTextEdited ?? s.rowText;
  await rowFor(page, finalText)
    .getByRole("button", { name: new RegExp(`Delete ${escape(singular)}`, "i") })
    .click();
  const confirm = page.getByRole("dialog");
  await expect(confirm).toBeVisible();
  await confirm.getByRole("button", { name: /^delete$/i }).click();
  await expect(confirm).toBeHidden({ timeout: 10_000 });
  await s.assertDbGone();
}

/** Fill a bilingual field (BilingualField renders #base_en / #base_fa). */
export async function fillBilingual(dialog: Locator, base: string, en: string, fa: string) {
  await dialog.locator(`#${base}_en`).fill(en);
  await dialog.locator(`#${base}_fa`).fill(fa);
}

/** Fill a plain field (Input id is f-<name>). */
export async function fillField(dialog: Locator, name: string, value: string) {
  await dialog.locator(`#f-${name}`).fill(value);
}

/** Switch to a tab inside the editor dialog. */
export async function tab(dialog: Locator, name: RegExp) {
  await dialog.getByRole("tab", { name }).click();
}

/** Set a MediaPicker value by typing into its URL input (nth picker on the form). */
export async function setMediaUrl(dialog: Locator, url: string, nth = 0) {
  await dialog.getByPlaceholder(/pick from library/i).nth(nth).fill(url);
}
