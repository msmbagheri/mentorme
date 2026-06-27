import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap font-semibold transition-all focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 [&_svg]:size-5 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        cta: "bg-gradient-cta text-white shadow-[var(--shadow-sm)] hover:brightness-105 hover:shadow-[var(--shadow-md)] hover:scale-[1.02]",
        primary:
          "bg-[var(--brand-primary)] text-white hover:brightness-110 shadow-[var(--shadow-sm)]",
        secondary:
          "border border-[var(--color-border)] bg-transparent text-[var(--color-text-primary)] hover:border-[var(--color-border-strong)] hover:bg-[var(--color-surface-alt)]",
        outline:
          "border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-primary)] hover:bg-[var(--color-surface-alt)]",
        ghost:
          "bg-transparent text-[var(--color-text-primary)] hover:bg-[var(--color-surface-alt)]",
        destructive: "bg-[var(--color-error)] text-white hover:brightness-110",
        link: "text-[var(--brand-primary)] underline-offset-4 hover:underline p-0 h-auto",
        text: "text-[var(--color-text-primary)] underline-offset-4 hover:underline p-0 h-auto",
      },
      size: {
        sm: "h-11 px-4 text-small rounded-[var(--radius-pill)]",
        md: "h-12 px-6 text-body rounded-[var(--radius-pill)]",
        lg: "h-14 px-7 text-body rounded-[var(--radius-pill)]",
        icon: "h-11 w-11 rounded-[var(--radius-md)]",
      },
    },
    defaultVariants: {
      variant: "cta",
      size: "md",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
