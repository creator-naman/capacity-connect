"use client";

import { cn } from "@/lib/utils";

export interface TabItem<T extends string> {
  key: T;
  label: string;
  count?: number;
}

/**
 * Underline-style tab strip. Controlled: the parent owns selection so tabs
 * compose with any state source.
 */
export function Tabs<T extends string>({
  items,
  active,
  onChange,
  ariaLabel,
  className,
}: {
  items: TabItem<T>[];
  active: T;
  onChange: (key: T) => void;
  ariaLabel: string;
  className?: string;
}) {
  return (
    <div
      role="tablist"
      aria-label={ariaLabel}
      className={cn("flex gap-1 overflow-x-auto border-b border-border", className)}
    >
      {items.map((item) => {
        const selected = item.key === active;
        return (
          <button
            key={item.key}
            role="tab"
            type="button"
            aria-selected={selected}
            onClick={() => onChange(item.key)}
            className={cn(
              "-mb-px flex shrink-0 items-center gap-1.5 border-b-2 px-3.5 py-2.5 text-sm font-medium transition-colors duration-150",
              selected
                ? "border-primary text-primary"
                : "border-transparent text-ink-secondary hover:border-border-strong hover:text-ink"
            )}
          >
            {item.label}
            {typeof item.count === "number" ? (
              <span className="rounded-[var(--radius-sm)] bg-surface-sunken px-1.5 py-0.5 font-mono text-[11px] tabular-nums text-ink-secondary">
                {item.count}
              </span>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}
