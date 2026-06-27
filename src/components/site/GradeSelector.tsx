"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import type { GradeOptionDTO } from "@/types/cms";
import type { AppLocale } from "@/types/locale";

const STORAGE_KEY = "mentorme:selectedGrade";

interface GradeSelectorProps {
  grades: GradeOptionDTO[];
  locale: AppLocale;
  /** Hidden input name so the selection can be carried into a lead form. */
  name?: string;
  className?: string;
  onSelect?: (value: string) => void;
}

/**
 * Grade funnel selector. Options come exclusively from CMS GradeOptionDTO[]
 * (never hardcoded). The selection is persisted to localStorage for the lead
 * funnel and mirrored into a hidden input. Selected state uses brand-primary
 * (NOT the logo gradient).
 */
export function GradeSelector({
  grades,
  name = "grade",
  className,
  onSelect,
}: GradeSelectorProps) {
  const [selected, setSelected] = React.useState<string>("");

  function choose(value: string) {
    setSelected(value);
    try {
      window.localStorage.setItem(STORAGE_KEY, value);
    } catch {
      /* storage may be unavailable; non-fatal */
    }
    onSelect?.(value);
  }

  if (grades.length === 0) return null;

  return (
    <div
      role="radiogroup"
      aria-label="Select your grade level"
      className={cn(
        "flex flex-col flex-wrap gap-2 sm:flex-row sm:gap-3",
        className,
      )}
    >
      {grades.map((g) => {
        const isSelected = selected === g.value;
        return (
          <button
            key={g.value}
            type="button"
            role="radio"
            aria-checked={isSelected}
            onClick={() => choose(g.value)}
            className={cn(
              "min-h-11 rounded-[var(--radius-pill)] border px-4 py-2 text-small font-semibold transition-colors",
              "w-full text-center sm:w-auto",
              isSelected
                ? "border-[var(--brand-primary)] bg-[var(--brand-primary)] text-white"
                : "border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-primary)] hover:border-[var(--brand-primary)] hover:bg-[var(--color-surface-alt)]",
            )}
          >
            {g.label}
          </button>
        );
      })}
      <input type="hidden" name={name} value={selected} />
    </div>
  );
}
