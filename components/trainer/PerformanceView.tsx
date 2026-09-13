"use client";

import { useMemo } from "react";
import { ChartLine } from "lucide-react";
import { useTrainerStore } from "@/lib/store/trainer-store";
import { participationFor } from "@/lib/data/demo/cohort";
import { PageHeader } from "@/components/ui/PageHeader";
import { PageSkeleton } from "@/components/ui/Skeleton";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";

interface Metric {
  key: string;
  label: string;
  description: string;
  pick: (stats: ReturnType<typeof participationFor>) => number;
}

const METRICS: Metric[] = [
  { key: "progress", label: "Mean module progress", description: "Average share of modules completed", pick: (s) => s.meanProgress },
  { key: "completion", label: "Completion rate", description: "Trainees who finished all modules", pick: (s) => s.completionRate },
  { key: "attempt", label: "Assessment attempt rate", description: "Trainees who attempted the assessment", pick: (s) => s.attemptRate },
  { key: "score", label: "Mean assessment score", description: "Average best score among attempts", pick: (s) => s.meanScore },
];

/** Course-level performance aggregates rendered as readable CSS bar charts. */
export function PerformanceView() {
  const { state, hydrated } = useTrainerStore();

  const rows = useMemo(
    () => state.courses.map((course) => ({ course, stats: participationFor(course) })),
    [state.courses]
  );

  if (!hydrated) return <PageSkeleton withStats={false} />;

  if (rows.length === 0) {
    return (
      <div className="flex flex-col gap-5">
        <PageHeader title="Performance" lead="Participation and assessment outcomes per course." />
        <EmptyState
          icon={ChartLine}
          title="Nothing to measure yet"
          description="Create a course and enroll a cohort — performance aggregates build from their activity."
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title="Performance"
        lead="Participation and assessment outcomes per course. Values are cohort means."
      />

      {METRICS.map((metric) => (
        <section key={metric.key} aria-labelledby={`metric-${metric.key}`} className="flex flex-col gap-3">
          <div>
            <h2 id={`metric-${metric.key}`} className="text-sm font-semibold text-ink">
              {metric.label}
            </h2>
            <p className="text-xs text-ink-muted">{metric.description}</p>
          </div>
          <Card className="flex flex-col gap-3.5 p-5">
            {rows.map(({ course, stats }) => {
              const value = metric.pick(stats);
              return (
                <div key={course.id} className="flex items-center gap-4">
                  <div className="w-40 shrink-0 sm:w-56">
                    <p className="truncate text-sm font-medium text-ink">{course.title}</p>
                    <p className="font-mono text-[11px] tabular-nums text-ink-muted">{course.code}</p>
                  </div>
                  <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-surface-sunken">
                    <div
                      className={
                        "h-full rounded-full transition-[width] duration-500 ease-out " +
                        (metric.key === "score" ? "bg-info" : metric.key === "attempt" ? "bg-primary" : "bg-accent")
                      }
                      style={{ width: `${value}%` }}
                    />
                  </div>
                  <span className="w-12 shrink-0 text-right font-mono text-sm tabular-nums text-ink">
                    {value}%
                  </span>
                </div>
              );
            })}
          </Card>
        </section>
      ))}

      {/* Attention list */}
      <section aria-labelledby="needs-attention" className="flex flex-col gap-3">
        <h2 id="needs-attention" className="text-sm font-semibold text-ink">
          Needs attention
        </h2>
        <Card className="divide-y divide-[var(--color-border)]">
          {rows
            .filter(({ stats }) => stats.atRiskCount > 0 || stats.meanProgress < 40)
            .map(({ course, stats }) => (
              <div key={course.id} className="flex flex-wrap items-center gap-3 px-5 py-4">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-ink">{course.title}</p>
                  <p className="text-xs text-ink-muted">
                    Mean progress {stats.meanProgress}%
                    {stats.atRiskCount > 0 ? ` · ${stats.atRiskCount} trainee${stats.atRiskCount > 1 ? "s" : ""} inactive 5+ days` : ""}
                  </p>
                </div>
                <Badge tone="warning">Review cohort</Badge>
              </div>
            ))}
          {rows.every(({ stats }) => stats.atRiskCount === 0 && stats.meanProgress >= 40) ? (
            <div className="px-5 py-4">
              <p className="text-sm text-ink-secondary">
                All cohorts are on track — no flagged courses this week.
              </p>
            </div>
          ) : null}
        </Card>
      </section>
    </div>
  );
}
