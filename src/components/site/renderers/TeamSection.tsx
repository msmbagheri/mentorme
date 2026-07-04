import Image from "next/image";
import Link from "next/link";
import { Linkedin } from "lucide-react";
import { SectionHeader } from "./SectionHeader";
import { CardCarousel } from "./CardCarousel";
import { cardBasis, normalizeCardsPerRow } from "./card-basis";
import { dictionary } from "@/lib/i18n";
import type { AppLocale } from "@/types/locale";
import type { TeamCategoryDTO, SectionHeaderDTO } from "@/types/cms";

interface TeamSectionProps {
  data: TeamCategoryDTO[];
  locale: AppLocale;
  header?: SectionHeaderDTO;
  cardsPerRow?: number;
}

/** Team: header + per-category member carousel (admin-configurable columns). */
export function TeamSection({ data, locale, header, cardsPerRow }: TeamSectionProps) {
  if (data.length === 0) return null;
  const t = dictionary[locale];
  const title = header?.title ?? (locale === "fa" ? "تیم ما" : "Meet The Team");
  const eyebrow = header?.eyebrow ?? null;
  const description = header?.description ?? null;
  const columns = normalizeCardsPerRow(cardsPerRow, 4);
  const basis = cardBasis(columns);

  return (
    <section
      id="team"
      aria-label={title}
      className="section-spacing bg-[var(--color-bg)]"
    >
      <div className="container-page flex flex-col gap-12">
        <SectionHeader
          eyebrow={eyebrow}
          title={title}
          description={description}
        />

        <div className="flex flex-col gap-12">
          {data.map((cat) => (
            <div key={cat.id} className="flex flex-col gap-6">
              {data.length > 1 && (
                <h3 className="text-h3 font-semibold text-[var(--color-text-primary)]">
                  {cat.title}
                </h3>
              )}
              <CardCarousel perRow={columns} itemCount={cat.members.length} locale={locale}>
                {cat.members.map((m) => (
                  <li
                    key={m.id}
                    className={`${basis} flex-col gap-3 rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-[var(--shadow-sm)]`}
                  >
                    {m.photoUrl && (
                      <div className="relative aspect-square w-full overflow-hidden rounded-[var(--radius-md)]">
                        <Image
                          src={m.photoUrl}
                          alt={m.photoAlt ?? m.name}
                          fill
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                          className="object-cover"
                        />
                      </div>
                    )}
                    <div className="flex flex-1 flex-col gap-1">
                      <p className="text-h4 font-semibold text-[var(--color-text-primary)]">
                        {m.name}
                      </p>
                      <p className="text-small text-[var(--color-text-muted)]">
                        {m.role}
                      </p>
                      <p className="mt-1 flex-1 text-small text-[var(--color-text-secondary)]">
                        {m.bio}
                      </p>
                    </div>
                    <div className="flex items-center gap-4 pt-1">
                      <Link
                        href={`/${locale}/team/${m.slug}`}
                        className="text-small font-semibold text-[var(--brand-primary)] hover:underline"
                      >
                        {t.viewProfile}
                      </Link>
                      {m.linkedinUrl && (
                        <a
                          href={m.linkedinUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={`${m.name} on LinkedIn`}
                          className="text-[var(--color-text-muted)] hover:text-[var(--brand-primary)]"
                        >
                          <Linkedin className="size-5" aria-hidden="true" />
                        </a>
                      )}
                    </div>
                  </li>
                ))}
              </CardCarousel>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
