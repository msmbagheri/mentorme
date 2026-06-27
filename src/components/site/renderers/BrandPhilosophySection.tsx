import Image from "next/image";
import { CtaButton } from "@/components/site/CtaButton";
import type { AppLocale } from "@/types/locale";
import type { BrandPhilosophyDTO } from "@/types/cms";

interface BrandPhilosophySectionProps {
  data: BrandPhilosophyDTO;
  locale: AppLocale;
}

/** Brand Philosophy: image | content (45/55 desktop, stacked on small screens). */
export function BrandPhilosophySection({ data }: BrandPhilosophySectionProps) {
  return (
    <section
      id="brand-philosophy"
      aria-label={data.title}
      className="section-spacing bg-[var(--color-bg)]"
    >
      <div className="container-page grid grid-cols-1 items-center gap-12 lg:grid-cols-[45fr_55fr]">
        {data.imageUrl && (
          <div className="relative aspect-[4/3] w-full overflow-hidden rounded-[var(--radius-xl)] shadow-[var(--shadow-md)]">
            <Image
              src={data.imageUrl}
              alt={data.imageAlt ?? data.title}
              fill
              sizes="(max-width: 1024px) 100vw, 45vw"
              className="object-cover"
            />
          </div>
        )}

        <div className="flex flex-col gap-5">
          {data.eyebrow && (
            <span className="text-small font-semibold uppercase tracking-wide text-[var(--brand-primary)]">
              {data.eyebrow}
            </span>
          )}
          <h2 className="text-h2 font-bold text-[var(--color-text-primary)]">
            {data.title}
          </h2>
          <div className="max-w-[600px] whitespace-pre-line text-body-lg text-[var(--color-text-secondary)]">
            {data.content}
          </div>
          {data.cta && (
            <div className="pt-2">
              <CtaButton cta={data.cta} variant="secondary" size="md" />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
