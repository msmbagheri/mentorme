import Image from "next/image";
import Link from "next/link";
import { Calendar, Clock, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { dictionary } from "@/lib/i18n";
import { formatDate, formatTime } from "@/lib/utils";
import type { AppLocale } from "@/types/locale";
import type { EventCardDTO } from "@/types/cms";

interface EventCardProps {
  event: EventCardDTO;
  locale: AppLocale;
}

/** Reusable event card: image + date badge, title, time, location, CTAs. */
export function EventCard({ event, locale }: EventCardProps) {
  const t = dictionary[locale];
  const href = `/${locale}/events/${event.slug}`;
  const dateBadge = formatDate(event.startDate, locale, {
    month: "short",
    day: "numeric",
  });
  const time = formatTime(event.startDate, locale, event.timezone ?? undefined);

  return (
    <article className="flex h-full flex-col overflow-hidden rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] shadow-[var(--shadow-sm)] transition-shadow hover:shadow-[var(--shadow-md)]">
      <div className="relative aspect-video w-full overflow-hidden bg-[var(--color-surface-alt)]">
        {event.imageUrl && (
          <Image
            src={event.imageUrl}
            alt={event.imageAlt ?? event.title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover"
          />
        )}
        <span className="absolute inset-block-start-3 inset-inline-start-3 inline-flex items-center gap-1 rounded-[var(--radius-sm)] bg-[var(--brand-primary)] px-3 py-1 text-small font-semibold text-white shadow-[var(--shadow-sm)]">
          <Calendar className="size-4" aria-hidden="true" />
          {dateBadge}
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-3 p-6">
        <h3 className="text-h4 font-semibold text-[var(--color-text-primary)]">
          {event.title}
        </h3>
        <div className="flex flex-col gap-1 text-small text-[var(--color-text-secondary)]">
          <span className="inline-flex items-center gap-2">
            <Clock className="size-4" aria-hidden="true" />
            {time}
          </span>
          {event.location && (
            <span className="inline-flex items-center gap-2">
              <MapPin className="size-4" aria-hidden="true" />
              {event.location}
            </span>
          )}
        </div>
        <p className="flex-1 text-body text-[var(--color-text-secondary)]">
          {event.shortDescription}
        </p>
        <div className="flex flex-col gap-3 pt-1 sm:flex-row">
          <Button asChild variant="cta" size="sm">
            <Link href={href} aria-label={`${t.register}: ${event.title}`}>
              {t.register}
            </Link>
          </Button>
          <Button asChild variant="secondary" size="sm">
            <Link href={href} aria-label={`${t.viewDetails}: ${event.title}`}>
              {t.viewDetails}
            </Link>
          </Button>
        </div>
      </div>
    </article>
  );
}
