import { cn } from "@/lib/utils";

const shimmer =
  "motion-safe:animate-[shimmer_1.4s_linear_infinite] bg-[linear-gradient(90deg,var(--color-surface-sunken)_25%,var(--color-border)_45%,var(--color-surface-sunken)_65%)] bg-[length:200%_100%] rounded-[var(--radius-sm)]";

/** Loading placeholder block; compose inside page-level skeletons. */
export function Skeleton({ className }: { className?: string }) {
  return <div aria-hidden="true" className={cn(shimmer, className)} />;
}

/** Standard page skeleton: header line + stat row + two content blocks. */
export function PageSkeleton({ withStats = true }: { withStats?: boolean }) {
  return (
    <div className="flex flex-col gap-5" role="status" aria-label="Loading">
      <span className="sr-only">Loading…</span>
      <div>
        <Skeleton className="h-6 w-56" />
        <Skeleton className="mt-2 h-4 w-72" />
      </div>
      {withStats ? (
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-[74px]" />
          ))}
        </div>
      ) : null}
      <div className="grid gap-4 lg:grid-cols-2">
        <Skeleton className="h-44" />
        <Skeleton className="h-44" />
      </div>
    </div>
  );
}
