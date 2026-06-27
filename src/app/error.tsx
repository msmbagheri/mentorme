"use client";

import { useEffect } from "react";
import Link from "next/link";
import { DEFAULT_LOCALE } from "@/types/locale";
import { dictionary } from "@/lib/i18n";

/**
 * Root error boundary (client component). Branded, English chrome by default,
 * with a reset action and a link home. Logs the error for observability.
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = dictionary[DEFAULT_LOCALE];

  useEffect(() => {
    // eslint-disable-next-line no-console
    console.error(error);
    // Auto-recover from a stale-build chunk load failure (reload once).
    const msg = `${error?.name ?? ""} ${error?.message ?? ""}`;
    const isChunkError =
      /ChunkLoadError|Loading chunk [\w-]+ failed|dynamically imported module/i.test(
        msg,
      );
    if (isChunkError) {
      try {
        const KEY = "__mm_chunk_reload_at";
        const last = sessionStorage.getItem(KEY);
        if (last === null || Date.now() - Number(last) >= 15_000) {
          sessionStorage.setItem(KEY, String(Date.now()));
          window.location.reload();
        }
      } catch {
        /* ignore */
      }
    }
  }, [error]);

  return (
    <main
      dir="ltr"
      className="min-h-[60vh] flex flex-col items-center justify-center gap-6 px-6 py-24 text-center"
    >
      <p className="text-h1 font-bold text-gradient-logo">500</p>
      <h1 className="text-h2 font-bold text-[var(--color-text-primary)]">
        {t.errorTitle}
      </h1>
      <p className="max-w-md text-body text-[var(--color-text-secondary)]">
        {t.errorBody}
      </p>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          onClick={reset}
          aria-label={t.tryAgain}
          className="inline-flex h-12 items-center justify-center rounded-[var(--radius-pill)] bg-gradient-cta px-6 font-semibold text-white shadow-[var(--shadow-sm)] transition-all hover:brightness-105"
        >
          {t.tryAgain}
        </button>
        <Link
          href={`/${DEFAULT_LOCALE}`}
          className="inline-flex h-12 items-center justify-center rounded-[var(--radius-pill)] border border-[var(--color-border)] bg-[var(--color-surface)] px-6 font-semibold text-[var(--color-text-primary)] transition-all hover:bg-[var(--color-surface-alt)]"
        >
          {t.backToHome}
        </Link>
      </div>
    </main>
  );
}
