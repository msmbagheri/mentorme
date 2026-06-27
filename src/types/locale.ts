export const LOCALES = ["en", "fa"] as const;
export type AppLocale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: AppLocale = "en";

export function isLocale(value: string): value is AppLocale {
  return (LOCALES as readonly string[]).includes(value);
}

export function dirFor(locale: AppLocale): "rtl" | "ltr" {
  return locale === "fa" ? "rtl" : "ltr";
}

export function otherLocale(locale: AppLocale): AppLocale {
  return locale === "en" ? "fa" : "en";
}

/** Database enum (EN/FA) <-> route locale (en/fa) helpers. */
export function toDbLocale(locale: AppLocale): "EN" | "FA" {
  return locale === "fa" ? "FA" : "EN";
}
