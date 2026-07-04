"use client";

import Image from "next/image";
import { Star } from "lucide-react";
import { CardCarousel } from "./CardCarousel";
import { cardBasis, normalizeCardsPerRow } from "./card-basis";
import type { AppLocale } from "@/types/locale";
import type { TestimonialDTO } from "@/types/cms";

interface TestimonialsCarouselProps {
  testimonials: TestimonialDTO[];
  /** Cards per row on desktop (1 | 2 | 4). Always 1-up on mobile. */
  perRow: number;
  locale: AppLocale;
}

function Stars({ rating }: { rating: number }) {
  const rounded = Math.round(rating);
  return (
    <div className="flex items-center gap-0.5" aria-hidden="true">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={
            i < rounded
              ? "size-4 fill-[var(--color-warning)] text-[var(--color-warning)]"
              : "size-4 text-[var(--color-border-strong)]"
          }
        />
      ))}
    </div>
  );
}

/** Testimonials carousel — a thin consumer of the generic CardCarousel. */
export function TestimonialsCarousel({ testimonials, perRow, locale }: TestimonialsCarouselProps) {
  if (testimonials.length === 0) return null;
  const columns = normalizeCardsPerRow(perRow, 1);
  const basis = cardBasis(columns);

  return (
    <CardCarousel perRow={columns} itemCount={testimonials.length} locale={locale}>
      {testimonials.map((t) => (
        <li key={t.id} className={basis}>
          <figure className="flex h-full w-full flex-col gap-4 rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-[var(--shadow-sm)]">
            <Stars rating={t.rating} />
            <blockquote className="flex-1 text-body text-[var(--color-text-primary)]">
              “{t.content}”
            </blockquote>
            <figcaption className="flex items-center gap-3">
              {t.avatarUrl && (
                <Image
                  src={t.avatarUrl}
                  alt={t.avatarAlt ?? t.name}
                  width={44}
                  height={44}
                  className="size-11 rounded-full object-cover"
                />
              )}
              <div>
                <p className="text-small font-semibold text-[var(--color-text-primary)]">
                  {t.name}
                </p>
                {(t.role || t.company) && (
                  <p className="text-caption text-[var(--color-text-secondary)]">
                    {[t.role, t.company].filter(Boolean).join(" · ")}
                  </p>
                )}
              </div>
            </figcaption>
          </figure>
        </li>
      ))}
    </CardCarousel>
  );
}
