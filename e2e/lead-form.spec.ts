import { test, expect } from "@playwright/test";

test.describe("Lead capture", () => {
  test("contact form submits and shows success", async ({ page, context }) => {
    // Use a unique forwarded IP so this test gets its own rate-limit bucket
    // (the limiter keys on client IP; localhost is shared across the suite).
    await context.setExtraHTTPHeaders({ "x-forwarded-for": `10.10.${Date.now() % 250}.5` });
    await page.goto("/en/contact");
    await page.fill("#lead-firstName", "E2E");
    await page.fill("#lead-lastName", "Tester");
    await page.fill("#lead-email", `e2e_${Date.now()}@example.com`);
    await page.fill("#lead-phone", "+1 555 222 3344");

    const [response] = await Promise.all([
      page.waitForResponse(
        (r) => r.url().includes("/api/leads") && r.request().method() === "POST",
      ),
      page.getByRole("button", { name: /send message/i }).click(),
    ]);

    expect(response.status()).toBe(201);
    const body = await response.json();
    expect(body.status).toBe("success");
    expect(body.data?.id).toBeTruthy();
    await expect(page.getByText(/Thank you/i)).toBeVisible();
  });

  test("invalid email is rejected by the API", async ({ request }) => {
    const res = await request.post("/api/leads", {
      headers: { "x-forwarded-for": `10.20.${Date.now() % 250}.9` },
      data: { firstName: "Bad", lastName: "Email", email: "not-an-email" },
    });
    expect(res.status()).toBe(422);
    const body = await res.json();
    expect(body.status).toBe("error");
  });

  test("lead endpoint rate-limits at 3 per IP per hour", async ({ request }) => {
    const ip = `10.30.${Date.now() % 250}.7`;
    const post = () =>
      request.post("/api/leads", {
        headers: { "x-forwarded-for": ip },
        data: {
          firstName: "RL",
          lastName: "Test",
          email: `rl_${Math.random().toString(36).slice(2)}@example.com`,
          source: "e2e-ratelimit",
        },
      });
    const r1 = await post();
    const r2 = await post();
    const r3 = await post();
    const r4 = await post();
    expect([r1.status(), r2.status(), r3.status()]).toEqual([201, 201, 201]);
    expect(r4.status()).toBe(429);
  });
});
