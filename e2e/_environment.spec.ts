import { test, expect } from "@playwright/test";

/**
 * Documentation test — surfaces the run's engine limitation directly in the HTML
 * report (it is not a functional check; it always passes).
 */
test("ENVIRONMENT NOTE: single-engine run — Chromium only (system Google Chrome). Mobile = Pixel 5 EMULATION on Chromium, NOT real WebKit/Firefox. The Playwright browser download is blocked in this environment, so cross-browser coverage was not possible.", async () => {
  test.info().annotations.push({
    type: "environment",
    description:
      "Engine: Chromium via channel:'chrome' (Google Chrome). Projects: desktop-chromium + mobile (Pixel 5 emulation). No WebKit/Firefox. '100% green' means one engine, not cross-browser.",
  });
  expect(true).toBe(true);
});
