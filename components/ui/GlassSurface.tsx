import type { ElementType, ComponentPropsWithoutRef } from "react";
import { cn } from "@/lib/utils";

/**
 * Translucent surface reserved for navigation chrome (Topbar, Sidebar).
 * Content cards use the opaque `Card` instead — glass is a supporting
 * language for wayfinding, not the product's default surface.
 */
export function GlassSurface<T extends ElementType = "div">({
  as,
  className,
  ...props
}: { as?: T } & ComponentPropsWithoutRef<T>) {
  const Component = as || "div";
  return (
    <Component
      className={cn(
        "bg-[var(--color-surface-glass)] backdrop-blur-md border-border",
        className
      )}
      {...props}
    />
  );
}
