import { CtaButton } from "@/components/site/CtaButton";
import { SiteMediaServer } from "@/components/site/SiteMediaServer";
import type { AppLocale } from "@/types/locale";
import type { FinalCtaDTO } from "@/types/cms";

interface FinalCtaSectionProps {
  data: FinalCtaDTO;
  locale: AppLocale;
}

/** Final CTA: centered single-focus block with optional background image. */
export function FinalCtaSection({ data }: FinalCtaSectionProps) {
  return (
    <section
      id="final-cta"
      aria-label={data.headline}
      className="relative isolate overflow-hidden bg-[var(--section-dark-bg,var(--color-text-primary))]"
    >
      {data.backgroundImageUrl && (
        <>
          <SiteMediaServer
            src={data.backgroundImageUrl}
            alt=""
            fill
            background
            sizes="100vw"
            className="-z-10 object-cover opacity-30"
          />
          <div
            className="absolute inset-0 -z-10 bg-[var(--color-text-primary)]/60"
            aria-hidden="true"
          />
        </>
      )}

      <div className="container-page section-spacing flex flex-col items-center gap-6 text-center">
        {data.eyebrow && (
          <span className="text-small font-semibold uppercase tracking-wide text-[var(--color-accent-blend)]">
            {data.eyebrow}
          </span>
        )}
        <h2 className="max-w-3xl text-h1 font-bold text-white">
          {data.headline}
        </h2>
        {data.subheadline && (
          <p className="max-w-[700px] text-body-lg text-white/85">
            {data.subheadline}
          </p>
        )}
        {(data.primaryCta || data.secondaryCta) && (
          <div className="flex flex-col gap-4 pt-2 sm:flex-row sm:items-center">
            {data.primaryCta && (
              <CtaButton cta={data.primaryCta} variant="cta" size="lg" />
            )}
            {data.secondaryCta && (
              <CtaButton
                cta={data.secondaryCta}
                variant="outline"
                size="lg"
              />
            )}
          </div>
        )}
        {data.trustStatement && (
          <p className="text-small text-white/70">{data.trustStatement}</p>
        )}
      </div>
    </section>
  );
}
