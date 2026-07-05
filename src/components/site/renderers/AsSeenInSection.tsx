import { dictionary } from "@/lib/i18n";
import { isVideoUrl } from "@/lib/media-url";
import type { AppLocale } from "@/types/locale";
import type { AsSeenInLogoDTO, SectionHeaderDTO } from "@/types/cms";

const LOGO_CLASS =
  "h-9 w-auto max-w-[180px] object-contain opacity-70 transition-opacity hover:opacity-100 md:h-11";

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
            // Height-normalize every logo (uniform height, natural width from the
            // logo's own aspect ratio). This keeps wide, square AND portrait logos
            // visually consistent and readable — unlike a fixed W×H box, which made
            // long-text logos shrink and square logos tiny. Plain <img> (not
            // next/image) so the browser uses each logo's true intrinsic aspect.
            const img = isVideoUrl(logo.imageUrl) ? (
              <video
                src={logo.imageUrl}
                aria-label={logo.alt ?? logo.title}
                muted
                autoPlay
                loop
                playsInline
                className={LOGO_CLASS}
              />
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={logo.imageUrl}
                alt={logo.alt ?? logo.title}
                loading="lazy"
                className={LOGO_CLASS}
              />
            );
            return (
              <li key={logo.id} className="flex h-11 shrink-0 items-center">
                {logo.url ? (
                  <a
                    href={logo.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={logo.title}
                    className="flex items-center"
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
