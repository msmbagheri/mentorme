import { cn } from "@/lib/utils";

interface SectionHeaderProps {
  eyebrow?: string | null;
  title: string;
  description?: string | null;
  align?: "center" | "start";
  className?: string;
}

/**
 * Shared section-header pattern: Eyebrow → Title → Description.
 * Used by every homepage section except Hero and Footer.
 */
export function SectionHeader({
  eyebrow,
  title,
  description,
  align = "center",
  className,
}: SectionHeaderProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-3",
        align === "center" ? "items-center text-center" : "items-start",
        className,
      )}
    >
      {eyebrow && (
        <span className="text-small font-semibold uppercase tracking-wide text-[var(--brand-primary)]">
          {eyebrow}
        </span>
      )}
      <h2 className="text-h2 font-bold text-[var(--color-text-primary)]">
        {title}
      </h2>
      {description && (
        <p
          className={cn(
            "max-w-2xl text-body-lg text-[var(--color-text-secondary)]",
            align === "center" ? "prose-justify-center mx-auto" : "prose-justify",
          )}
        >
          {description}
        </p>
      )}
    </div>
  );
}
