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
  // Fill the row based on step count (up to 4-up on desktop) so a 5th+ step
  // wraps and centers instead of dangling under a fixed 4-column grid.
  const columns = Math.min(Math.max(data.length, 1), 4);
  const lgWidth: Record<number, string> = {
    1: "lg:w-full",
    2: "lg:w-[calc((100%-1.5rem)/2)]",
    3: "lg:w-[calc((100%-3rem)/3)]",
    4: "lg:w-[calc((100%-4.5rem)/4)]",
  };
  const cardWidth = `w-full sm:w-[calc((100%-1.5rem)/2)] ${lgWidth[columns]}`;

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
        <ul className="flex flex-wrap justify-center gap-6">
          {data.map((step) => {
            const Icon = resolveIcon(step.icon);
            return (
              <li
                key={step.id}
                className={`flex flex-col gap-4 rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--card-surface,var(--color-surface))] p-6 shadow-[var(--shadow-sm)] transition-shadow hover:shadow-[var(--shadow-md)] ${cardWidth}`}
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
                <p className="prose-justify text-body text-[var(--color-text-secondary)]">
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
