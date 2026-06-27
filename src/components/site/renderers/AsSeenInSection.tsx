import Image from "next/image";
import { dictionary } from "@/lib/i18n";
import type { AppLocale } from "@/types/locale";
import type { AsSeenInLogoDTO, SectionHeaderDTO } from "@/types/cms";

interface AsSeenInSectionProps {
  data: AsSeenInLogoDTO[];
  locale: AppLocale;
  header?: SectionHeaderDTO;
}

/** As Seen In: label + responsive logo strip (scrolls on mobile). */
export function AsSeenInSection({ data, locale, header }: AsSeenInSectionProps) {
  if (data.length === 0) return null;
  const label =
    header?.title ?? (locale === "fa" ? "ما را اینجا دیده‌اید" : "As Seen In");
  void dictionary;

  return (
    <section
      id="as-seen-in"
      aria-label={label}
      className="border-y border-[var(--color-border)] bg-[var(--color-surface)] py-10"
    >
      <div className="container-page flex flex-col gap-6">
        <p className="text-center text-small font-semibold uppercase tracking-wide text-[var(--color-text-muted)]">
          {label}
        </p>
        <ul className="flex items-center gap-8 overflow-x-auto md:flex-wrap md:justify-center md:gap-10 md:overflow-visible">
          {data.map((logo) => {
            const img = (
              <Image
                src={logo.imageUrl}
                alt={logo.alt ?? logo.title}
                width={140}
                height={48}
                className="h-12 w-auto object-contain opacity-70 transition-opacity hover:opacity-100"
              />
            );
            return (
              <li key={logo.id} className="shrink-0">
                {logo.url ? (
                  <a
                    href={logo.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={logo.title}
                  >
                    {img}
                  </a>
                ) : (
                  img
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
