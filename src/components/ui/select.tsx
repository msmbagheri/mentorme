import * as React from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Styled native <select> — SSR-friendly, RTL-safe, keyboard accessible by default.
 */
const Select = React.forwardRef<
  HTMLSelectElement,
  React.SelectHTMLAttributes<HTMLSelectElement>
>(({ className, children, ...props }, ref) => (
  <div className="relative">
    <select
      ref={ref}
      className={cn(
        "h-12 w-full appearance-none rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] px-4 pe-10 text-body text-[var(--color-text-primary)] transition-colors focus:border-[var(--color-accent-blend)] focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    >
      {children}
    </select>
    <ChevronDown
      className="pointer-events-none absolute inset-inline-end-3 top-1/2 size-5 -translate-y-1/2 text-[var(--color-text-muted)] end-3"
      aria-hidden
    />
  </div>
));
Select.displayName = "Select";

export { Select };
