"use client";

import { cn } from "@/lib/utils";
import { resolveIcon, ICON_NAMES } from "@/lib/icons";

/**
 * Visual icon picker sourced from the real lucide library (lib/icons ICON_MAP).
 * Editors click an icon instead of typing a free-form string; clicking the
 * selected icon again clears it. Stores the canonical icon name string.
 */
export function IconPicker({
  value,
  onChange,
  disabled,
}: {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}) {
  const current = value.trim().toLowerCase();
  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap gap-2">
        {ICON_NAMES.map((name) => {
          const Icon = resolveIcon(name);
          const selected = current === name;
          return (
            <button
              type="button"
              key={name}
              disabled={disabled}
              onClick={() => onChange(selected ? "" : name)}
              aria-label={name}
              aria-pressed={selected}
              title={name}
              className={cn(
                "flex size-10 items-center justify-center rounded-[var(--radius-md)] border transition-colors",
                selected
                  ? "border-[var(--brand-primary)] bg-[var(--brand-primary)]/10 text-[var(--brand-primary)]"
                  : "border-[var(--color-border)] text-[var(--color-text-secondary)] hover:border-[var(--brand-primary)] hover:text-[var(--brand-primary)]",
                disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer",
              )}
            >
              <Icon className="size-5" aria-hidden="true" />
            </button>
          );
        })}
      </div>
      <p className="text-caption text-[var(--color-text-muted)]">
        {value ? `Selected: ${value}` : "No icon selected"}
      </p>
    </div>
  );
}
