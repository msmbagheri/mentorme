import Link from "next/link";
import type { Metadata } from "next";
import { DEFAULT_LOCALE } from "@/types/locale";
import { dictionary } from "@/lib/i18n";

export const metadata: Metadata = {
  title: "Page not found | MentorMe",
  robots: { index: false, follow: false },
};

/**
 * Root-level 404 (used for requests outside the localized site, e.g. before
 * the locale segment resolves). Defaults to English chrome strings.
 */
export default function NotFound() {
  const t = dictionary[DEFAULT_LOCALE];
  return (
    <main
      dir="ltr"
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
        href={`/${DEFAULT_LOCALE}`}
        className="inline-flex h-12 items-center justify-center rounded-[var(--radius-pill)] bg-gradient-cta px-6 font-semibold text-white shadow-[var(--shadow-sm)] transition-all hover:brightness-105"
      >
        {t.backToHome}
      </Link>
    </main>
  );
}
