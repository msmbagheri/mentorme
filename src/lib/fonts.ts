/**
 * Per-section font support. Editors pick a family from SECTION_FONT_OPTIONS in
 * the Homepage Builder; the value is stored on HomepageSection.fontFamily and
 * injected as scoped `--font-en` / `--font-fa` overrides on the section wrapper.
 *
 * The built CSS stack always keeps the theme fonts as a fallback, so a
 * Latin-only choice still renders Persian glyphs via var(--font-vazirmatn).
 */

/** Selectable per-section font families. "" = inherit the global theme font. */
export const SECTION_FONT_OPTIONS: { value: string; label: string }[] = [
  { value: "", label: "Theme default" },
  { value: "Vazirmatn", label: "Vazirmatn (Persian)" },
  { value: "Inter", label: "Inter" },
  { value: "Georgia", label: "Georgia (serif)" },
  { value: "Tahoma", label: "Tahoma" },
  { value: "Arial", label: "Arial" },
];

/** Strip characters that could break out of a CSS value / inline style. */
function familyName(v: string | null | undefined): string | null {
  if (!v) return null;
  const cleaned = v.replace(/["';{}<>\\]/g, "").trim();
  return cleaned || null;
}

/**
 * Build the `--font-en` / `--font-fa` overrides for a section font family.
 * Returns null when no (valid) family is set so the section inherits the theme.
 */
export function sectionFontVars(
  family: string | null | undefined,
): { "--font-en": string; "--font-fa": string } | null {
  const f = familyName(family);
  if (!f) return null;
  return {
    "--font-en": `"${f}", var(--font-inter), "Segoe UI", sans-serif`,
    "--font-fa": `"${f}", var(--font-vazirmatn), sans-serif`,
  };
}
