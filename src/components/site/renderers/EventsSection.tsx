import { SectionHeader } from "./SectionHeader";
import { EventCard } from "@/components/site/EventCard";
import type { AppLocale } from "@/types/locale";
import type { EventCardDTO, SectionHeaderDTO } from "@/types/cms";

interface EventsSectionProps {
  data: EventCardDTO[];
  locale: AppLocale;
  header?: SectionHeaderDTO;
}

/** Events & Webinars: header + 3-col grid (2 tablet / 1 mobile). */
export function EventsSection({ data, locale, header }: EventsSectionProps) {
  if (data.length === 0) return null;
  const title =
    header?.title ?? (locale === "fa" ? "رویدادها و وبینارها" : "Events & Webinars");
  const eyebrow = header?.eyebrow ?? null;
  const description = header?.description ?? null;

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
        <ul className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {data.map((e) => (
            <li key={e.id} className="h-full">
              <EventCard event={e} locale={locale} />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
