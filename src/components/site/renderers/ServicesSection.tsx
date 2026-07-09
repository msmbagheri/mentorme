import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { SectionHeader } from "./SectionHeader";
import { SiteMediaServer } from "@/components/site/SiteMediaServer";
import { CardCarousel } from "./CardCarousel";
import { cardBasis, effectiveColumns } from "./card-basis";
import { dictionary } from "@/lib/i18n";
import type { AppLocale } from "@/types/locale";
import type { ServiceCardDTO, SectionHeaderDTO } from "@/types/cms";

interface ServicesSectionProps {
  data: ServiceCardDTO[];
  locale: AppLocale;
  header?: SectionHeaderDTO;
  cardsPerRow?: number;
}

/** Services: header + admin-configurable card carousel (no empty trailing space). */
export function ServicesSection({ data, locale, header, cardsPerRow }: ServicesSectionProps) {
  if (data.length === 0) return null;
  const t = dictionary[locale];
  const title = header?.title ?? (locale === "fa" ? "خدمات ما" : "Our Services");
  const eyebrow = header?.eyebrow ?? null;
  const description = header?.description ?? null;
  const columns = effectiveColumns(cardsPerRow, data.length, 3);
  const basis = cardBasis(columns);

  return (
    <section
      id="services"
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
          {data.map((s) => (
            <li key={s.id} className={basis}>
              <Link
                href={`/${locale}/services/${s.slug}`}
                className="group flex h-full flex-col overflow-hidden rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--card-surface,var(--color-surface))] shadow-[var(--shadow-sm)] transition-shadow hover:shadow-[var(--shadow-md)]"
              >
                {s.imageUrl && (
                  <div className="relative aspect-[16/10] w-full overflow-hidden">
                    <SiteMediaServer
                      src={s.imageUrl}
                      alt={s.imageAlt ?? s.title}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  </div>
                )}
                <div className="flex flex-1 flex-col gap-3 p-6">
                  <h3 className="text-h4 font-semibold text-[var(--color-text-primary)]">
                    {s.title}
                  </h3>
                  <p className="flex-1 text-body text-[var(--color-text-secondary)]">
                    {s.shortDescription}
                  </p>
                  <span className="inline-flex items-center gap-1 text-body font-semibold text-[var(--brand-primary)]">
                    {t.viewDetails}
                    <ArrowRight
                      className="size-4 transition-transform group-hover:translate-x-1 rtl:rotate-180"
                      aria-hidden="true"
                    />
                  </span>
                </div>
              </Link>
            </li>
          ))}
        </CardCarousel>
      </div>
    </section>
  );
}
