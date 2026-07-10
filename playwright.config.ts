import { defineConfig, devices } from "@playwright/test";

const PORT = 3100;
// Local default; the production run sets E2E_BASE_URL=https://mentorme.ir.
const BASE_URL = process.env.E2E_BASE_URL ?? `http://localhost:${PORT}`;
const IS_REMOTE = !!process.env.E2E_BASE_URL;

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 2 : 4,
  reporter: [["list"], ["html", { open: "never", outputFolder: "playwright-report" }]],
  // Purge E2E fixtures after the run (set E2E_PURGE=1; required for production).
  globalTeardown: "./e2e/global-teardown.ts",
  // Admin CRUD lifecycle tests measure ~25s in ISOLATION under `next dev`
  // (verified with and without app changes — not a regression), so 30s left
  // no headroom for parallel-worker interleaving and caused flaky timeouts
  // whose leftover fixtures then cascaded into homepage-overflow failures.
  timeout: 45_000,
  expect: { timeout: 10_000 },
  use: {
    baseURL: BASE_URL,
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    locale: "en-US",
  },
  projects: [
    {
      // Desktop engine: runs the full suite (admin CRUD + public). Skips the
      // mobile-only spec (its assertions assume a phone viewport / hamburger nav).
      name: "chromium",
      use: { ...devices["Desktop Chrome"], channel: "chrome" },
      testIgnore: /mobile-rtl\.spec\.ts/,
    },
    {
      // Phone viewport (Pixel 5) — public-facing rendering only. Admin panel is
      // not a mobile target, so admin/CRUD specs do not run here.
      name: "mobile",
      use: { ...devices["Pixel 5"], channel: "chrome" },
      testMatch:
        /(public-site|i18n-rtl|seo|detail-pages|lead-form|success-stories|mobile-rtl)\.spec\.ts/,
    },
  ],
  // Only manage a local server when targeting localhost; against production
  // (E2E_BASE_URL set) the app is already deployed, so do not start one.
  // Local runs use `next dev`: the login captcha's test bypass is double-gated to
  // NON-production (src/lib/captcha.ts), so the suite runs in development with
  // CAPTCHA_TEST_BYPASS=1 while the deployed production build stays fully enforced.
  webServer: IS_REMOTE
    ? undefined
    : {
        command: `npx next dev -p ${PORT}`,
        url: `${BASE_URL}/en`,
        reuseExistingServer: true,
        timeout: 180_000,
        stdout: "ignore",
        stderr: "pipe",
        env: { CAPTCHA_TEST_BYPASS: "1" },
      },
});
