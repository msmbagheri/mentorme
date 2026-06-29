import { test, expect } from "@playwright/test";
import { loginAs } from "./helpers";
import { db } from "./db";

test("Lead lifecycle: public submit → DB → admin sees it → status change persists", async ({ page, context }) => {
  // Unique forwarded IP so this test owns its rate-limit bucket.
  await context.setExtraHTTPHeaders({ "x-forwarded-for": `10.40.${Date.now() % 250}.6` });
  const stamp = Date.now();
  const email = `e2e.lead.${stamp}@example.com`;

  // ---- PUBLIC submit ----
  await page.goto("/en/contact");
  await page.fill("#lead-firstName", "E2E");
  await page.fill("#lead-lastName", `Lead${stamp}`);
  await page.fill("#lead-email", email);
  await page.fill("#lead-phone", "+1 555 999 0000");
  const [res] = await Promise.all([
    page.waitForResponse((r) => r.url().includes("/api/leads") && r.request().method() === "POST"),
    page.getByRole("button", { name: /send message/i }).click(),
  ]);
  expect(res.status()).toBe(201);
  await expect(page.getByText(/thank you/i)).toBeVisible();

  // ---- DB ----
  const lead = await db.lead.findFirst({ where: { email } });
  expect(lead?.status).toBe("NEW");

  // ---- ADMIN sees it + changes status ----
  await loginAs(page, "admin");
  await page.goto("/admin/leads");
  await expect(page.getByText(email).first()).toBeVisible({ timeout: 10_000 });
  await page.locator("tr").filter({ hasText: email }).getByRole("button", { name: /open lead/i }).click();

  await expect(page.locator("#lead-status")).toBeVisible({ timeout: 10_000 });
  await page.locator("#lead-status").selectOption("CONTACTED");
  await page.getByRole("button", { name: /save changes/i }).click();

  await expect.poll(async () => (await db.lead.findUnique({ where: { id: lead!.id } }))?.status, { timeout: 8_000 }).toBe("CONTACTED");

  // Cleanup E2E lead.
  await db.leadActivity.deleteMany({ where: { leadId: lead!.id } });
  await db.lead.delete({ where: { id: lead!.id } });
});
