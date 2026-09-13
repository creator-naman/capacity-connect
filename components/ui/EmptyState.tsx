import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

/** Quiet empty state for data-driven views. Never a blank page. */
export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-[var(--radius-md)] border border-dashed border-border-strong bg-surface px-6 py-12 text-center",
        className
      )}
    >
      <span className="flex h-11 w-11 items-center justify-center rounded-[var(--radius-sm)] bg-surface-sunken text-ink-muted">
        <Icon size={22} strokeWidth={1.75} />
      </span>
      <p className="mt-4 text-sm font-semibold text-ink">{title}</p>
      <p className="mt-1.5 max-w-sm text-sm leading-relaxed text-ink-secondary">{description}</p>
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}
