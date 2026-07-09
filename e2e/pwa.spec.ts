import { test, expect } from "@playwright/test";

const PNG_MAGIC = "89504e470d0a1a0a";

test.describe("PWA / Add to Home Screen", () => {
  test("manifest is served with app identity and icons", async ({ request }) => {
    const res = await request.get("/manifest.webmanifest");
    expect(res.status()).toBe(200);
    const manifest = await res.json();
    expect(manifest.name).toBeTruthy();
    expect(manifest.short_name).toBeTruthy();
    expect(manifest.display).toBe("standalone");
    expect(manifest.start_url).toBe("/");
    expect(manifest.theme_color).toMatch(/.+/);
    const sizes = manifest.icons.map((i: { sizes: string }) => i.sizes);
    expect(sizes).toContain("192x192");
    expect(sizes).toContain("512x512");
    expect(
      manifest.icons.some((i: { purpose?: string }) => i.purpose === "maskable"),
    ).toBe(true);
  });

  test("generated icons are real PNGs", async ({ request }) => {
    const paths = [
      "/api/pwa/icon?size=180",
      "/api/pwa/icon?size=512&maskable=1",
      "/apple-touch-icon.png",
      "/favicon.ico",
    ];
    for (const path of paths) {
      const res = await request.get(path);
      expect(res.status(), path).toBe(200);
      expect(res.headers()["content-type"], path).toBe("image/png");
      const body = await res.body();
      expect(body.subarray(0, 8).toString("hex"), path).toBe(PNG_MAGIC);
      expect(body.length, path).toBeGreaterThan(500);
    }
  });

  test("unsupported icon size is rejected", async ({ request }) => {
    // The app answers a clean body-less 400. Through the production CDN a
    // 4xx is replaced by an edge error page (wcdn-status: NFC) that strict
    // HTTP/1.1 clients abort on — either way it must never succeed.
    try {
      const res = await request.get("/api/pwa/icon?size=9999");
      expect(res.status()).toBe(400);
    } catch (error) {
      expect(String(error)).toContain("aborted");
    }
  });

  test("head declares manifest, apple-touch-icon and iOS web-app metas", async ({
    page,
  }) => {
    await page.goto("/en");
    await expect(page.locator('link[rel="manifest"]')).toHaveAttribute(
      "href",
      "/manifest.webmanifest",
    );
    const apple = page.locator('link[rel="apple-touch-icon"]');
    await expect(apple).toHaveCount(1);
    await expect(apple).toHaveAttribute("href", /\/api\/pwa\/icon\?size=180/);
    await expect(
      page.locator('meta[name="apple-mobile-web-app-capable"]'),
    ).toHaveAttribute("content", "yes");
    await expect(
      page.locator('meta[name="apple-mobile-web-app-title"]'),
    ).toHaveAttribute("content", /.+/);
    await expect(page.locator('meta[name="theme-color"]')).toHaveCount(1);
    expect(await page.locator('link[rel="icon"]').count()).toBeGreaterThan(0);
  });

  test("service worker script is served", async ({ request }) => {
    const res = await request.get("/sw.js");
    expect(res.status()).toBe(200);
    expect(res.headers()["content-type"]).toContain("javascript");
    expect(await res.text()).toContain('addEventListener("fetch"');
  });
});
