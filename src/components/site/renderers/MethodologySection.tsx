import { SectionHeader } from "./SectionHeader";
import { resolveIcon } from "@/lib/icons";
import type { AppLocale } from "@/types/locale";
import type { MethodologyStepDTO, SectionHeaderDTO } from "@/types/cms";

interface MethodologySectionProps {
  data: MethodologyStepDTO[];
  locale: AppLocale;
  header?: SectionHeaderDTO;
}

/** Methodology: section header + step grid (4 cols desktop / 2×2 tablet / stack mobile). */
export function MethodologySection({
  data,
  locale,
  header,
}: MethodologySectionProps) {
  if (data.length === 0) return null;
  const title = header?.title ?? (locale === "fa" ? "روش ما" : "Our Methodology");
  const eyebrow = header?.eyebrow ?? null;
  const description = header?.description ?? null;

  return (
    <section
      id="methodology"
      aria-label={title}
      className="section-spacing bg-[var(--color-bg)]"
    >
      <div className="container-page flex flex-col gap-12">
        <SectionHeader
          eyebrow={eyebrow}
          title={title}
          description={description}
        />
        <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {data.map((step) => {
            const Icon = resolveIcon(step.icon);
            return (
              <li
                key={step.id}
                className="flex h-full flex-col gap-4 rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-[var(--shadow-sm)] transition-shadow hover:shadow-[var(--shadow-md)]"
              >
                <span className="text-h2 font-bold text-[var(--color-border-strong)]">
                  {String(step.stepNumber).padStart(2, "0")}
                </span>
                <span className="flex size-16 items-center justify-center rounded-[var(--radius-md)] bg-[var(--color-surface-alt)] text-[var(--brand-primary)]">
                  <Icon className="size-8" aria-hidden="true" />
                </span>
                <h3 className="text-h4 font-semibold text-[var(--color-text-primary)]">
                  {step.title}
                </h3>
                <p className="text-body text-[var(--color-text-secondary)]">
                  {step.description}
                </p>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
