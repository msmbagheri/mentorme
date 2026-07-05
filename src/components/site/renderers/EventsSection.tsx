import { SectionHeader } from "./SectionHeader";
import { CardCarousel } from "./CardCarousel";
import { cardBasis, effectiveColumns } from "./card-basis";
import { EventCard } from "@/components/site/EventCard";
import type { AppLocale } from "@/types/locale";
import type { EventCardDTO, SectionHeaderDTO } from "@/types/cms";

interface EventsSectionProps {
  data: EventCardDTO[];
  locale: AppLocale;
  header?: SectionHeaderDTO;
  cardsPerRow?: number;
}

/** Events & Webinars: header + admin-configurable card carousel. */
export function EventsSection({ data, locale, header, cardsPerRow }: EventsSectionProps) {
  if (data.length === 0) return null;
  const title =
    header?.title ?? (locale === "fa" ? "رویدادها و وبینارها" : "Events & Webinars");
  const eyebrow = header?.eyebrow ?? null;
  const description = header?.description ?? null;
  const columns = effectiveColumns(cardsPerRow, data.length, 3);
  const basis = cardBasis(columns);

  return (
    <section
      id="events"
      aria-label={title}
      className="section-spacing bg-[var(--color-surface)]"
    >
      <div className="container-page flex flex-col gap-12">
        <SectionHeader
          eyebrow={eyebrow}
          title={title}
          description={description}
        />
        <CardCarousel perRow={columns} itemCount={data.length} locale={locale}>
          {data.map((e) => (
            <li key={e.id} className={basis}>
              <EventCard event={e} locale={locale} />
            </li>
          ))}
        </CardCarousel>
      </div>
    </section>
  );
}
