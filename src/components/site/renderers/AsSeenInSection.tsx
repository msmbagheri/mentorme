import { dictionary } from "@/lib/i18n";
import { isVideoUrl } from "@/lib/media-url";
import type { AppLocale } from "@/types/locale";
import type { AsSeenInLogoDTO, SectionHeaderDTO } from "@/types/cms";

const LOGO_CLASS =
  "h-9 w-auto max-w-[180px] object-contain opacity-70 transition-opacity hover:opacity-100 md:h-11";

/** Above this many brands the strip auto-scrolls as a looping marquee (#4). */
const MARQUEE_THRESHOLD = 5;
/** Marquee pace: one second per brand for a full pass over the list. */
const SECONDS_PER_BRAND = 1;

interface AsSeenInSectionProps {
  data: AsSeenInLogoDTO[];
  locale: AppLocale;
  header?: SectionHeaderDTO;
}

function LogoItem({ logo }: { logo: AsSeenInLogoDTO }) {
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
    // Height-normalize every logo (uniform height, natural width from the
    // logo's own aspect ratio). This keeps wide, square AND portrait logos
    // visually consistent and readable — unlike a fixed W×H box, which made
    // long-text logos shrink and square logos tiny. Plain <img> (not
    // next/image) so the browser uses each logo's true intrinsic aspect.
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={logo.imageUrl}
      alt={logo.alt ?? logo.title}
      loading="lazy"
      className={LOGO_CLASS}
    />
  );
  return logo.url ? (
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
  );
}

/**
 * As Seen In: label + logo strip. Up to 5 logos render as a static centered
 * row; more than 5 auto-scroll as a seamless looping marquee (one second per
 * brand, pauses on hover, direction-independent).
 */
export function AsSeenInSection({ data, locale, header }: AsSeenInSectionProps) {
  if (data.length === 0) return null;
  const label =
    header?.title ?? (locale === "fa" ? "ما را اینجا دیده‌اید" : "As Seen In");
  void dictionary;
  const marquee = data.length > MARQUEE_THRESHOLD;

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
        {marquee ? (
          // The track holds the list TWICE and the keyframes slide it by half
          // its width, so the loop is seamless. dir=ltr keeps the translate
          // direction correct in both locales.
          <div className="logo-marquee" dir="ltr">
            <ul
              className="logo-marquee-track items-center"
              style={{
                ["--marquee-duration" as string]: `${data.length * SECONDS_PER_BRAND}s`,
              }}
            >
              {[0, 1].map((copy) =>
                data.map((logo) => (
                  <li
                    key={`${copy}-${logo.id}`}
                    aria-hidden={copy === 1 || undefined}
                    className="flex h-11 shrink-0 items-center px-4 md:px-5"
                  >
                    <LogoItem logo={logo} />
                  </li>
                )),
              )}
            </ul>
          </div>
        ) : (
          <ul className="flex items-center gap-8 overflow-x-auto md:flex-wrap md:justify-center md:gap-10 md:overflow-visible">
            {data.map((logo) => (
              <li key={logo.id} className="flex h-11 shrink-0 items-center">
                <LogoItem logo={logo} />
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
