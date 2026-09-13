import { cn } from "@/lib/utils";

export function ProgressBar({
  value,
  label,
  className,
  size = "md",
}: {
  /** 0-100. */
  value: number;
  label?: string;
  className?: string;
  size?: "sm" | "md";
}) {
  const clamped = Math.max(0, Math.min(100, Math.round(value)));
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      {label ? (
        <div className="flex items-center justify-between text-xs">
          <span className="text-ink-muted">{label}</span>
          <span className="font-mono tabular-nums text-ink-secondary">{clamped}%</span>
        </div>
      ) : null}
      <div
        role="progressbar"
        aria-valuenow={clamped}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label ?? "Progress"}
        className={cn(
          "w-full overflow-hidden rounded-full bg-surface-sunken",
          size === "sm" ? "h-1.5" : "h-2"
        )}
      >
        <div
          className="h-full rounded-full bg-accent transition-[width] duration-500 ease-out"
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  );
}
