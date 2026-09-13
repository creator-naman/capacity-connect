import { forwardRef } from "react";
import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export type Variant = "primary" | "secondary" | "ghost";
export type Size = "sm" | "md";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

const variantStyles: Record<Variant, string> = {
  primary: "bg-primary text-ink-inverted hover:bg-primary-hover",
  secondary:
    "bg-surface text-ink border border-border-strong hover:bg-surface-sunken",
  ghost: "text-ink-secondary hover:bg-surface-sunken hover:text-ink",
};

const sizeStyles: Record<Size, string> = {
  sm: "h-8 px-3 text-sm",
  md: "h-10 px-4 text-sm",
};

/**
 * Shared with Link-based buttons (e.g. form success panels) so anchors
 * and buttons are visually identical.
 */
export function buttonClassName(
  variant: Variant = "primary",
  size: Size = "md"
): string {
  return cn(
    "inline-flex items-center justify-center gap-2 rounded-[var(--radius-sm)] font-medium",
    "transition-colors duration-150 ease-out",
    "disabled:opacity-40 disabled:pointer-events-none",
    variantStyles[variant],
    sizeStyles[size]
  );
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(buttonClassName(variant, size), className)}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";
