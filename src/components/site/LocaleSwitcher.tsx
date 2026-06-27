"use client";

import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { dictionary } from "@/lib/i18n";
import { LOCALES, otherLocale, type AppLocale } from "@/types/locale";

interface LocaleSwitcherProps {
  locale: AppLocale;
  className?: string;
}

/**
 * Toggles between EN and FA while preserving the current path (and query).
 * Uses a full navigation so the root layout re-renders `<html dir/lang>` with
 * the correct direction (RTL/LTR) — a soft client navigation would leave the
 * document direction stale.
 */
export function LocaleSwitcher({ locale, className }: LocaleSwitcherProps) {
  const pathname = usePathname() ?? `/${locale}`;
  const target = otherLocale(locale);
  const t = dictionary[locale];

  function swap() {
    // Replace the leading /{locale} segment; default to /{target} if absent.
    const segments = pathname.split("/");
    if (segments[1] && (LOCALES as readonly string[]).includes(segments[1])) {
      segments[1] = target;
    } else {
      segments.splice(1, 0, target);
    }
    const next = segments.join("/") || `/${target}`;
    if (typeof window !== "undefined") {
      window.location.assign(next);
    }
  }

  return (
    <button
      type="button"
      onClick={swap}
      aria-label={t.switchLanguage}
      className={cn(
        "inline-flex h-11 min-w-11 items-center justify-center rounded-[var(--radius-pill)] border border-[var(--color-border)] px-3 text-small font-semibold text-[var(--color-text-primary)] transition-colors hover:border-[var(--color-border-strong)] hover:bg-[var(--color-surface-alt)]",
        className,
      )}
    >
      {target === "fa" ? "فا" : "EN"}
    </button>
  );
}
