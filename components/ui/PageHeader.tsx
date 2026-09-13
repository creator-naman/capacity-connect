import { cn } from "@/lib/utils";

/** Consistent page heading block: title, one-line lead, optional actions. */
export function PageHeader({
  title,
  lead,
  actions,
  className,
}: {
  title: string;
  lead?: string;
  actions?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-wrap items-end justify-between gap-3", className)}>
      <div>
        <h1 className="text-xl font-semibold text-ink">{title}</h1>
        {lead ? <p className="mt-1 text-sm text-ink-secondary">{lead}</p> : null}
      </div>
      {actions ? <div className="flex items-center gap-2">{actions}</div> : null}
    </div>
  );
}
