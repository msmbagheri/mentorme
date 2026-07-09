import "server-only";
import { promises as fs } from "fs";
import path from "path";
import { cache } from "react";
import sharp from "sharp";
import { getThemeRaw, THEME_DEFAULTS } from "@/services/theme.service";
import { isVideoUrl } from "@/lib/media-url";

/**
 * PWA branding + home-screen icon generation.
 *
 * iOS "Add to Home Screen" shows a black/blank tile when the page declares no
 * apple-touch-icon (Safari falls back to a darkened page snapshot), and treats
 * the entry as a throwaway web clip without a valid manifest. All icons here
 * are generated with sharp from the CMS logo (favicon → mobile → primary), so
 * whatever the admin uploads becomes the installable app icon — no rebuild.
 */

export interface PwaBranding {
  name: string;
  description: string;
  themeColor: string;
  accentColor: string;
  /** Icon cache-buster derived from the theme row's updatedAt. */
  version: string;
  /** Stored URL of the best available icon artwork, if any. */
  iconSource: string | null;
}

/**
 * Branding for manifest/metadata/icons. Never throws: during `next build`
 * (placeholder DATABASE_URL, no live DB) it falls back to design defaults so
 * static shells like /_not-found can still prerender; real values are picked
 * up at request time because every consumer renders dynamically or under ISR.
 */
export const getPwaBranding = cache(async (): Promise<PwaBranding> => {
  let row: Awaited<ReturnType<typeof getThemeRaw>> = null;
  try {
    row = await getThemeRaw();
  } catch {
    row = null;
  }
  const iconSource =
    [row?.faviconUrl, row?.mobileLogoUrl, row?.primaryLogoUrl].find(
      (url) => !!url && !isVideoUrl(url),
    ) ?? null;
  return {
    name: row?.brandName || THEME_DEFAULTS.brandName,
    description: row?.tagline_en || THEME_DEFAULTS.tagline.en,
    themeColor: safeColor(row?.primaryColor, THEME_DEFAULTS.primaryColor),
    accentColor: safeColor(row?.accentColor, THEME_DEFAULTS.accentColor),
    version: row?.updatedAt ? row.updatedAt.getTime().toString(36) : "0",
    iconSource,
  };
});

/** Sizes the icon endpoint will render (favicon, apple-touch, manifest). */
export const PWA_ICON_SIZES = [32, 48, 64, 180, 192, 512] as const;
export type PwaIconSize = (typeof PWA_ICON_SIZES)[number];

/** Href for a generated icon; `v` busts caches when the theme changes. */
export function pwaIconHref(
  size: PwaIconSize,
  version: string,
  maskable = false,
): string {
  return `/api/pwa/icon?size=${size}${maskable ? "&maskable=1" : ""}&v=${version}`;
}

// ---- Rendering -------------------------------------------------------------

const UPLOAD_DIR = process.env.UPLOAD_DIR ?? "public/uploads";

// Theme colors are free-form admin strings; only interpolate into SVG markup
// when they look like a plain CSS color literal.
function safeColor(value: string | null | undefined, fallback: string): string {
  const v = (value ?? "").trim();
  return /^[#a-zA-Z0-9(),.%\s-]{1,40}$/.test(v) && v ? v : fallback;
}

function escapeXml(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

/** Load the raw bytes behind a stored media URL (uploads, public/, or remote). */
async function readIconSource(url: string): Promise<Buffer | null> {
  const clean = url.split("?")[0].split("#")[0];
  if (clean.startsWith("/")) {
    // Uploaded media (`/api/media/file/<name>` or `/uploads/<name>`): flat
    // files in UPLOAD_DIR, addressed by sanitized basename like the media route.
    const fileName = path.basename(clean);
    if (fileName && fileName !== "." && fileName !== "..") {
      try {
        return await fs.readFile(path.join(process.cwd(), UPLOAD_DIR, fileName));
      } catch {
        /* fall through to public/ lookup */
      }
    }
    // Build-time static asset under public/ (guard against traversal).
    const publicRoot = path.resolve(process.cwd(), "public");
    const resolved = path.resolve(publicRoot, `.${clean}`);
    if (resolved.startsWith(publicRoot + path.sep)) {
      try {
        return await fs.readFile(resolved);
      } catch {
        return null;
      }
    }
    return null;
  }
  if (/^https?:\/\//i.test(clean)) {
    try {
      const res = await fetch(url, { signal: AbortSignal.timeout(4000) });
      if (!res.ok) return null;
      return Buffer.from(await res.arrayBuffer());
    } catch {
      return null;
    }
  }
  return null;
}

/**
 * Square PNG from the logo artwork. Alpha is flattened to white first — iOS
 * renders transparent icon pixels as BLACK on the home screen — then the
 * artwork is letterboxed onto a background sampled from its own top-left
 * pixel so non-square logos get seamless padding instead of white bars.
 * Maskable icons get a wider margin to survive Android's circular crop.
 */
async function composeIcon(
  source: Buffer,
  size: number,
  maskable: boolean,
): Promise<Buffer> {
  const flat = await sharp(source, { density: 256 })
    .flatten({ background: "#ffffff" })
    .png()
    .toBuffer();
  const { data } = await sharp(flat)
    .extract({ left: 0, top: 0, width: 1, height: 1 })
    .raw()
    .toBuffer({ resolveWithObject: true });
  const background = { r: data[0], g: data[1], b: data[2] };
  const pad = Math.round(size * (maskable ? 0.18 : 0.08));
  const inner = size - pad * 2;
  return sharp(flat)
    .resize(inner, inner, { fit: "contain", background })
    .extend({ top: pad, bottom: pad, left: pad, right: pad, background })
    .png()
    .toBuffer();
}

/** Brand-gradient monogram tile for when no usable logo is configured. */
async function fallbackIcon(branding: PwaBranding, size: number): Promise<Buffer> {
  const initial = escapeXml((branding.name.trim()[0] ?? "M").toUpperCase());
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${branding.themeColor}"/>
      <stop offset="1" stop-color="${branding.accentColor}"/>
    </linearGradient>
  </defs>
  <rect width="100%" height="100%" fill="url(#g)"/>
  <text x="50%" y="50%" dy="0.36em" text-anchor="middle" font-family="DejaVu Sans, Arial, sans-serif" font-weight="700" font-size="${Math.round(size * 0.52)}" fill="#ffffff">${initial}</text>
</svg>`;
  return sharp(Buffer.from(svg)).png().toBuffer();
}

// Rendered icons are tiny; memoize per (source, theme version, size, shape) so
// repeat requests don't re-run sharp on the single-core production VPS.
const iconCache = new Map<string, Buffer>();
const ICON_CACHE_MAX = 32;

/** Render the site icon as a `size`×`size` PNG (never throws). */
export async function renderPwaIcon(
  size: PwaIconSize,
  maskable = false,
): Promise<Buffer> {
  const branding = await getPwaBranding();
  const key = `${branding.iconSource}|${branding.version}|${size}|${maskable}`;
  const hit = iconCache.get(key);
  if (hit) return hit;

  let png: Buffer | null = null;
  if (branding.iconSource) {
    const source = await readIconSource(branding.iconSource);
    if (source) {
      try {
        png = await composeIcon(source, size, maskable);
      } catch {
        png = null;
      }
    }
  }
  if (!png) {
    try {
      png = await fallbackIcon(branding, size);
    } catch {
      // Last resort: solid theme-color square (no SVG/text rasterization).
      png = await sharp({
        create: {
          width: size,
          height: size,
          channels: 3,
          background: "#1e3a8a",
        },
      })
        .png()
        .toBuffer();
    }
  }

  if (iconCache.size >= ICON_CACHE_MAX) iconCache.clear();
  iconCache.set(key, png);
  return png;
}

/** Href for the generated Open Graph banner (1200×630, from the CMS logo). */
export function pwaOgHref(version: string): string {
  return `/api/pwa/og?v=${version}`;
}

const OG_WIDTH = 1200;
const OG_HEIGHT = 630;

/**
 * 1200×630 Open Graph banner: the CMS logo centered on a background sampled
 * from the logo's own corner. Default share image for link previews (#18) —
 * pages/SEO settings with an explicit ogImageUrl still take precedence.
 */
export async function renderOgImage(): Promise<Buffer> {
  const branding = await getPwaBranding();
  const key = `og|${branding.iconSource}|${branding.version}`;
  const hit = iconCache.get(key);
  if (hit) return hit;

  let png: Buffer | null = null;
  if (branding.iconSource) {
    const source = await readIconSource(branding.iconSource);
    if (source) {
      try {
        const flat = await sharp(source, { density: 256 })
          .flatten({ background: "#ffffff" })
          .png()
          .toBuffer();
        const { data } = await sharp(flat)
          .extract({ left: 0, top: 0, width: 1, height: 1 })
          .raw()
          .toBuffer({ resolveWithObject: true });
        const background = { r: data[0], g: data[1], b: data[2] };
        const inner = await sharp(flat)
          .resize(Math.round(OG_WIDTH * 0.5), Math.round(OG_HEIGHT * 0.82), {
            fit: "contain",
            background,
          })
          .png()
          .toBuffer();
        png = await sharp({
          create: { width: OG_WIDTH, height: OG_HEIGHT, channels: 3, background },
        })
          .composite([{ input: inner, gravity: "centre" }])
          .png()
          .toBuffer();
      } catch {
        png = null;
      }
    }
  }
  if (!png) {
    // No usable logo: brand-gradient banner (mirrors the icon fallback).
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${OG_WIDTH}" height="${OG_HEIGHT}">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${branding.themeColor}"/>
      <stop offset="1" stop-color="${branding.accentColor}"/>
    </linearGradient>
  </defs>
  <rect width="100%" height="100%" fill="url(#g)"/>
  <text x="50%" y="50%" dy="0.36em" text-anchor="middle" font-family="DejaVu Sans, Arial, sans-serif" font-weight="700" font-size="110" fill="#ffffff">${escapeXml(branding.name)}</text>
</svg>`;
    png = await sharp(Buffer.from(svg)).png().toBuffer();
  }

  if (iconCache.size >= ICON_CACHE_MAX) iconCache.clear();
  iconCache.set(key, png);
  return png;
}

/** Standard success response for icon routes. */
export function pngResponse(png: Buffer): Response {
  return new Response(new Uint8Array(png), {
    status: 200,
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800",
    },
  });
}
