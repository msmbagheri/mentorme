import { getThemeRaw } from "@/services/theme.service";

/**
 * Injects the DB-driven theme as a runtime CSS override of the :root token layer
 * defined in globals.css. Loaded after the stylesheet so these values win.
 * Covers brand colors, the CTA gradient, and bilingual fonts (Latin / Persian),
 * including custom webfonts loaded via @import (CSS) or @font-face (font files).
 */

// Allow only safe CSS value characters (colors, gradients, family names).
function cssValue(v: string | null | undefined): string | null {
  if (!v) return null;
  const cleaned = v.replace(/[;{}<>\\]/g, "").trim();
  return cleaned || null;
}

function safeUrl(v: string | null | undefined): string | null {
  if (!v) return null;
  const t = v.trim();
  return /^https?:\/\/[^\s"')]+$/.test(t) ? t : null;
}

function familyName(v: string | null | undefined): string | null {
  if (!v) return null;
  const cleaned = v.replace(/["';{}<>\\]/g, "").trim();
  return cleaned || null;
}

// Global CTA button dimension presets, keyed by ThemeSetting.buttonSize.
const BUTTON_SIZE_VARS: Record<string, string> = {
  sm: "--btn-height:2.75rem;--btn-padding-x:1rem;",
  md: "--btn-height:3rem;--btn-padding-x:1.5rem;",
  lg: "--btn-height:3.5rem;--btn-padding-x:1.75rem;",
};

const FONT_FORMATS: Record<string, string> = {
  ".woff2": "woff2",
  ".woff": "woff",
  ".ttf": "truetype",
  ".otf": "opentype",
};

function fontFace(family: string | null, url: string | null): string | null {
  if (!family || !url) return null;
  const ext = Object.keys(FONT_FORMATS).find((e) => url.toLowerCase().includes(e));
  if (!ext) return null; // not a direct font file — handled via @import instead
  return `@font-face{font-family:"${family}";src:url("${url}") format("${FONT_FORMATS[ext]}");font-display:swap;}`;
}

export async function ThemeStyle() {
  const theme = await getThemeRaw();
  if (!theme) return null;

  const primary = cssValue(theme.primaryColor);
  const accent = cssValue(theme.accentColor);
  const gStart = cssValue(theme.ctaGradientStart);
  const gEnd = cssValue(theme.ctaGradientEnd);
  const latinFamily = familyName(theme.fontFamilyLatin);
  const faFamily = familyName(theme.fontFamilyPersian);
  const latinUrl = safeUrl(theme.fontUrlLatin);
  const faUrl = safeUrl(theme.fontUrlPersian);

  const imports: string[] = [];
  const faces: string[] = [];
  for (const [family, url] of [
    [latinFamily, latinUrl],
    [faFamily, faUrl],
  ] as const) {
    if (!url) continue;
    const face = fontFace(family, url);
    if (face) faces.push(face);
    else imports.push(`@import url("${url}");`); // CSS @font-face stylesheet (e.g. Vazirmatn)
  }

  const root: string[] = [];
  if (primary) root.push(`--brand-primary:${primary};`);
  if (accent) root.push(`--brand-accent:${accent};`);
  if (gStart && gEnd) root.push(`--gradient-cta:linear-gradient(135deg, ${gStart}, ${gEnd});`);
  if (latinFamily) root.push(`--font-en:"${latinFamily}", var(--font-inter), "Segoe UI", sans-serif;`);
  if (faFamily) root.push(`--font-fa:"${faFamily}", var(--font-vazirmatn), sans-serif;`);
  const btn = BUTTON_SIZE_VARS[theme.buttonSize ?? ""];
  if (btn) root.push(btn);

  const css = [
    ...imports, // @import must precede other rules
    ...faces,
    root.length ? `:root{${root.join("")}}` : "",
  ]
    .filter(Boolean)
    .join("\n");

  if (!css) return null;
  return <style id="mentorme-theme" dangerouslySetInnerHTML={{ __html: css }} />;
}
