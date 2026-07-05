"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { AppLocale } from "@/types/locale";

interface CardCarouselProps {
  /** Desktop columns (1|2|3|4). Cards are 1-up on mobile regardless. */
  perRow: number;
  /** Total number of cards — arrows only show when it exceeds perRow. */
  itemCount: number;
  locale: AppLocale;
  /** The `<li>` cards, each with `cardBasis(perRow)` applied by the caller. */
  children: React.ReactNode;
}

/**
 * Generic horizontal card carousel: a scroll-snap flex track (which lays out
 * only the cards that exist — no phantom grid tracks, so no trailing empty
 * space) plus prev/next arrows. RTL-aware. Card markup stays in the (server)
 * caller and is passed as children.
 */
export function CardCarousel({ perRow, itemCount, locale, children }: CardCarouselProps) {
  const trackRef = React.useRef<HTMLUListElement>(null);
  const isRtl = locale === "fa";
  const showArrows = itemCount > perRow;

  const prevLabel = isRtl ? "قبلی" : "Previous";
  const nextLabel = isRtl ? "بعدی" : "Next";

  function scrollByPage(direction: 1 | -1) {
    const el = trackRef.current;
    if (!el) return;
    // Page by the TRUE inter-card step (card width + gap), not clientWidth —
    // clientWidth omits the flex gap, so scrolling by it lands short of the next
    // snap point and scroll-snap needs a second nudge to settle the card.
    const items = el.children;
    const step =
      items.length >= 2
        ? Math.abs(
            (items[1] as HTMLElement).offsetLeft -
              (items[0] as HTMLElement).offsetLeft,
          ) * perRow
        : el.clientWidth;
    el.scrollBy({ left: step * (isRtl ? -direction : direction), behavior: "smooth" });
  }

  return (
    <div className="flex flex-col gap-4">
      <ul
        ref={trackRef}
        className="flex snap-x snap-mandatory gap-6 overflow-x-auto scroll-smooth pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {children}
      </ul>

      {showArrows && (
        <div className="flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => scrollByPage(-1)}
            aria-label={prevLabel}
            className="flex size-11 items-center justify-center rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-primary)] transition-colors hover:border-[var(--brand-primary)] hover:text-[var(--brand-primary)]"
          >
            <ChevronLeft className="size-5 rtl:hidden" aria-hidden="true" />
            <ChevronRight className="hidden size-5 rtl:block" aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={() => scrollByPage(1)}
            aria-label={nextLabel}
            className="flex size-11 items-center justify-center rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-primary)] transition-colors hover:border-[var(--brand-primary)] hover:text-[var(--brand-primary)]"
          >
            <ChevronRight className="size-5 rtl:hidden" aria-hidden="true" />
            <ChevronLeft className="hidden size-5 rtl:block" aria-hidden="true" />
          </button>
        </div>
      )}
    </div>
  );
}
