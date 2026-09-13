import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

/** Compact stat tile for dashboards. Values use the mono face on purpose. */
export function StatCard({
  icon: Icon,
  value,
  label,
  tone = "neutral",
  href,
}: {
  icon: LucideIcon;
  value: number | string;
  label: string;
  tone?: "neutral" | "accent" | "primary" | "warning";
  href?: string;
}) {
  const toneClasses = {
    neutral: "bg-surface-sunken text-ink-secondary",
    accent: "bg-accent-soft text-accent",
    primary: "bg-primary-soft text-primary",
    warning: "bg-warning-soft text-warning",
  }[tone];

  const content = (
    <>
      <span className={cn("flex h-9 w-9 items-center justify-center rounded-[var(--radius-sm)]", toneClasses)}>
        <Icon size={18} strokeWidth={1.75} />
      </span>
      <div className="leading-tight">
        <p className="font-mono text-xl font-medium tabular-nums text-ink">{value}</p>
        <p className="mt-0.5 text-xs text-ink-muted">{label}</p>
      </div>
    </>
  );

  if (href) {
    return (
      <a
        href={href}
        className="flex items-center gap-3.5 rounded-[var(--radius-md)] border border-border bg-surface p-4 transition-colors hover:border-border-strong"
      >
        {content}
      </a>
    );
  }

  return (
    <div className="flex items-center gap-3.5 rounded-[var(--radius-md)] border border-border bg-surface p-4">
      {content}
    </div>
  );
}
