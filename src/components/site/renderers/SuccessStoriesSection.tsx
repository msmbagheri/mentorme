import Link from "next/link";
import { SectionHeader } from "./SectionHeader";
import { SiteMediaServer } from "@/components/site/SiteMediaServer";
import { CardCarousel } from "./CardCarousel";
import { cardBasis, effectiveColumns } from "./card-basis";
import { Badge } from "@/components/ui/badge";
import { dictionary } from "@/lib/i18n";
import type { AppLocale } from "@/types/locale";
import type { CaseStudyCardDTO, SectionHeaderDTO } from "@/types/cms";

interface SuccessStoriesSectionProps {
  data: CaseStudyCardDTO[];
  locale: AppLocale;
  header?: SectionHeaderDTO;
  cardsPerRow?: number;
}

/** Success Stories: header + admin-configurable card carousel. Photo 1:1, outcome badge. */
export function SuccessStoriesSection({
  data,
  locale,
  header,
  cardsPerRow,
}: SuccessStoriesSectionProps) {
  if (data.length === 0) return null;
  const t = dictionary[locale];
  const title =
    header?.title ?? (locale === "fa" ? "داستان‌های موفقیت" : "Success Stories");
  const eyebrow = header?.eyebrow ?? null;
  const description = header?.description ?? null;
  const columns = effectiveColumns(cardsPerRow, data.length, 3);
  const basis = cardBasis(columns);

  return (
    <section
      id="success-stories"
      aria-label={title}
      className="section-spacing bg-[var(--color-bg)]"
    >
      <div className="container-page flex flex-col gap-12">
        <SectionHeader
          eyebrow={eyebrow}
          title={title}
          description={description}
        />
        <CardCarousel perRow={columns} itemCount={data.length} locale={locale}>
          {data.map((cs) => (
            <li key={cs.id} className={basis}>
              <Link
                href={`/${locale}/case-studies/${cs.slug}`}
                className="group flex h-full flex-col gap-4 rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--card-surface,var(--color-surface))] p-6 shadow-[var(--shadow-sm)] transition-shadow hover:shadow-[var(--shadow-md)]"
              >
                {cs.imageUrl && (
                  <div className="relative aspect-square w-full overflow-hidden rounded-[var(--radius-md)]">
                    <SiteMediaServer
                      src={cs.imageUrl}
                      alt={cs.imageAlt ?? cs.name}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className="object-cover"
                    />
                  </div>
                )}
                <div className="flex flex-1 flex-col gap-3">
                  <p className="text-h4 font-semibold text-[var(--color-text-primary)]">
                    {cs.name}
                  </p>
                  {cs.outcomeBadge && (
                    <Badge variant="success" className="self-start">
                      {cs.outcomeBadge}
                    </Badge>
                  )}
                  <p className="line-clamp-5 flex-1 text-body text-[var(--color-text-secondary)]">
                    {cs.story}
                  </p>
                  <span className="text-body font-semibold text-[var(--brand-primary)]">
                    {t.readMore}
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
