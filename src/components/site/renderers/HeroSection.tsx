import { Star } from "lucide-react";
import { CtaButton } from "@/components/site/CtaButton";
import { GradeSelector } from "@/components/site/GradeSelector";
import { SiteMediaServer } from "@/components/site/SiteMediaServer";
import type { AppLocale } from "@/types/locale";
import type { HeroDTO } from "@/types/cms";

interface HeroSectionProps {
  data: HeroDTO;
  locale: AppLocale;
}

/** Hero: 50/50 desktop (content | image 4:5), stacked on tablet/mobile. */
export function HeroSection({ data, locale }: HeroSectionProps) {
  return (
    <section
      id="hero"
      aria-label="Hero"
      // Tighter spacing than the shared section rhythm: the hero (text, CTAs,
      // trust row AND image) must fit a desktop viewport without scrolling (#2).
      className="bg-gradient-soft py-10 md:py-12"
    >
      <div className="container-page grid grid-cols-1 items-center gap-8 lg:grid-cols-2 lg:gap-10">
        <div className="flex flex-col gap-6">
          {data.eyebrow && (
            <span className="text-small font-semibold uppercase tracking-wide text-[var(--brand-primary)]">
              {data.eyebrow}
            </span>
          )}
          <h1 className="text-h1 font-bold text-[var(--color-text-primary)]">
            {data.headline}
          </h1>
          <p className="max-w-[560px] text-body-lg text-[var(--color-text-secondary)]">
            {data.subheadline}
          </p>

          {data.grades.length > 0 && (
            <GradeSelector grades={data.grades} locale={locale} />
          )}

          {(data.primaryCta || data.secondaryCta) && (
            <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center">
              {data.primaryCta && (
                <CtaButton cta={data.primaryCta} variant="cta" size="lg" />
              )}
              {data.secondaryCta && (
                <CtaButton
                  cta={data.secondaryCta}
                  variant="secondary"
                  size="lg"
                />
              )}
            </div>
          )}

          {data.trustBadge && (
            <div className="flex items-center gap-2 text-small text-[var(--color-text-secondary)]">
              <Star
                className="size-4 fill-[var(--color-warning)] text-[var(--color-warning)]"
                aria-hidden="true"
              />
              <span>{data.trustBadge}</span>
            </div>
          )}
        </div>

        {data.imageUrl && (
          // Height-capped to the viewport (minus header + hero padding) so a
          // tall 4:5 art never pushes the copy or CTAs below the fold.
          <div className="relative aspect-[4/5] max-h-[45svh] w-full overflow-hidden rounded-[var(--radius-xl)] shadow-[var(--shadow-lg)] lg:max-h-[calc(100svh-16rem)]">
            <SiteMediaServer
              src={data.imageUrl}
              alt={data.imageAlt ?? data.headline}
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
            />
          </div>
        )}
      </div>
    </section>
  );
}
