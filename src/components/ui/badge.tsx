import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-[var(--radius-pill)] px-3 py-0.5 text-small font-semibold",
  {
    variants: {
      variant: {
        neutral:
          "bg-[var(--color-surface-alt)] text-[var(--color-text-secondary)]",
        brand: "bg-[var(--color-surface-alt)] text-[var(--brand-primary)]",
        success: "bg-[var(--color-success-soft)] text-[var(--color-success)]",
        warning: "bg-[var(--color-warning-soft)] text-[var(--color-warning)]",
        error: "bg-[var(--color-error-soft)] text-[var(--color-error)]",
        info: "bg-[var(--color-info-soft)] text-[var(--color-info)]",
      },
    },
    defaultVariants: { variant: "neutral" },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
