import { SiteMediaServer } from "@/components/site/SiteMediaServer";
import type { AppLocale } from "@/types/locale";
import type { FounderMessageDTO } from "@/types/cms";

interface FounderMessageSectionProps {
  data: FounderMessageDTO;
  locale: AppLocale;
}

/** Founder Message: image | message (40/60 desktop, stacked small). */
export function FounderMessageSection({ data }: FounderMessageSectionProps) {
  return (
    <section
      id="founder-message"
      aria-label={data.name}
      className="section-spacing bg-[var(--color-surface)]"
    >
      <div className="container-page grid grid-cols-1 items-center gap-12 lg:grid-cols-[40fr_60fr]">
        {data.photoUrl && (
          <div className="relative mx-auto aspect-[4/5] w-full max-w-sm overflow-hidden rounded-[var(--radius-xl)] shadow-[var(--shadow-md)] lg:mx-0">
            <SiteMediaServer
              src={data.photoUrl}
              alt={data.photoAlt ?? data.name}
              fill
              sizes="(max-width: 1024px) 100vw, 40vw"
              className="object-cover"
            />
          </div>
        )}

        <figure className="flex flex-col gap-5">
          <div>
            <p className="text-h3 font-bold text-[var(--color-text-primary)]">
              {data.name}
            </p>
            <p className="text-body text-[var(--color-text-secondary)]">
              {data.title}
            </p>
          </div>
          <blockquote className="whitespace-pre-line text-body-lg leading-relaxed text-[var(--color-text-primary)]">
            {data.message}
          </blockquote>
          {data.signatureUrl && (
            <SiteMediaServer
              src={data.signatureUrl}
              alt={`${data.name} signature`}
              width={180}
              height={64}
              className="h-16 w-auto object-contain"
            />
          )}
        </figure>
      </div>
    </section>
  );
}
