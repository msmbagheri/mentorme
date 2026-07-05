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
      className="section-spacing bg-gradient-soft"
    >
      <div className="container-page grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
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
          <div className="relative aspect-[4/5] w-full overflow-hidden rounded-[var(--radius-xl)] shadow-[var(--shadow-lg)]">
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
