import Link from "next/link";
import { headers } from "next/headers";
import { isLocale, DEFAULT_LOCALE, dirFor } from "@/types/locale";
import type { AppLocale } from "@/types/locale";
import { dictionary } from "@/lib/i18n";

/**
 * Localized 404 for the public site. Reads the active locale from the
 * `x-locale` header set by middleware so EN (LTR) and FA (RTL) both render.
 */
export default async function LocaleNotFound() {
  const headerLocale = (await headers()).get("x-locale") ?? DEFAULT_LOCALE;
  const locale: AppLocale = isLocale(headerLocale)
    ? headerLocale
    : DEFAULT_LOCALE;
  const t = dictionary[locale];

  return (
    <main
      dir={dirFor(locale)}
      className="min-h-[60vh] flex flex-col items-center justify-center gap-6 px-6 py-24 text-center"
    >
      <p className="text-h1 font-bold text-gradient-logo">404</p>
      <h1 className="text-h2 font-bold text-[var(--color-text-primary)]">
        {t.notFoundTitle}
      </h1>
      <p className="max-w-md text-body text-[var(--color-text-secondary)]">
        {t.notFoundBody}
      </p>
      <Link
        href={`/${locale}`}
        className="inline-flex h-12 items-center justify-center rounded-[var(--radius-pill)] bg-gradient-cta px-6 font-semibold text-white shadow-[var(--shadow-sm)] transition-all hover:brightness-105"
      >
        {t.backToHome}
      </Link>
    </main>
  );
}
