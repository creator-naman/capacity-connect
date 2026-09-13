"use client";

import { useMemo, useState } from "react";
import { Users, TriangleAlert } from "lucide-react";
import { useTrainerStore } from "@/lib/store/trainer-store";
import { COHORT, participationFor, isInactive } from "@/lib/data/demo/cohort";
import { PageHeader } from "@/components/ui/PageHeader";
import { PageSkeleton } from "@/components/ui/Skeleton";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { EmptyState } from "@/components/ui/EmptyState";
import { relativeDays } from "@/lib/format";

/**
 * Trainee monitoring across all of the trainer's courses: per-trainee
 * progress and scores, course filter, and inactive-trainee highlighting.
 */
export function TraineesView() {
  const { state, hydrated } = useTrainerStore();
  const [courseFilter, setCourseFilter] = useState<string>("all");

  const courseRows = useMemo(
    () => state.courses.map((course) => ({ course, stats: participationFor(course) })),
    [state.courses]
  );

  // Deterministic cohort, restricted to courses this trainer owns.
  const rows = useMemo(() => {
    const ownedIds = new Set(state.courses.map((c) => c.id));
    return COHORT.map((trainee) => {
      const courses = Object.keys(trainee.progress).filter((id) => ownedIds.has(id));
      const relevant = courseFilter === "all" ? courses : courses.filter((id) => id === courseFilter);
      const meanProgress = relevant.length
        ? Math.round(relevant.reduce((sum, id) => sum + (trainee.progress[id] ?? 0), 0) / relevant.length)
        : null;
      const inactive = isInactive(trainee.lastActiveAt);
      return { trainee, courses: relevant, meanProgress, inactive };
    })
      .filter((row) => row.courses.length > 0)
      .sort((a, b) => (a.inactive === b.inactive ? (b.meanProgress ?? 0) - (a.meanProgress ?? 0) : a.inactive ? -1 : 1));
  }, [state.courses, courseFilter]);

  if (!hydrated) return <PageSkeleton withStats={false} />;

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title="Trainees"
        lead="Participation across your sections — progress, scores, and activity recency."
      />

      <div className="flex flex-wrap items-center gap-1.5">
        <FilterChip label="All courses" active={courseFilter === "all"} onClick={() => setCourseFilter("all")} />
        {courseRows.map(({ course, stats }) => (
          <FilterChip
            key={course.id}
            label={`${course.code} · ${stats.traineeCount}`}
            active={courseFilter === course.id}
            onClick={() => setCourseFilter(course.id)}
          />
        ))}
      </div>

      {rows.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No trainees to monitor"
          description="Once trainees enroll in your courses they appear here with progress and scores."
        />
      ) : (
        <Card className="divide-y divide-[var(--color-border)]">
          {rows.map(({ trainee, courses, meanProgress, inactive }) => (
            <div key={trainee.id} className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center">
              <div className="min-w-0 sm:w-56">
                <p className="flex items-center gap-2 text-sm font-medium text-ink">
                  {trainee.name}
                  {inactive ? (
                    <Badge tone="warning">
                      <TriangleAlert size={11} strokeWidth={1.75} className="mr-1" />
                      inactive
                    </Badge>
                  ) : null}
                </p>
                <p className="text-xs text-ink-muted">
                  {trainee.designation} · {trainee.region}
                </p>
              </div>

              <div className="min-w-0 flex-1">
                {meanProgress !== null ? (
                  <ProgressBar value={meanProgress} size="sm" label="Mean progress" />
                ) : (
                  <p className="text-xs text-ink-muted">Not enrolled in the selected course</p>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-1.5 sm:w-44 sm:justify-end">
                {courses.map((id) => {
                  const course = state.courses.find((c) => c.id === id);
                  const score = trainee.scores[id];
                  return (
                    <Badge key={id} tone="neutral">
                      {course?.code}
                      {score !== undefined ? (
                        <span className={"ml-1 font-mono tabular-nums " + (score >= 60 ? "text-success" : "text-warning")}>
                          {score}%
                        </span>
                      ) : null}
                    </Badge>
                  );
                })}
              </div>

              <p className="shrink-0 text-xs text-ink-muted sm:w-28 sm:text-right">
                {relativeDays(trainee.lastActiveAt)}
              </p>
            </div>
          ))}
        </Card>
      )}
    </div>
  );
}

function FilterChip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={
        "h-8 rounded-full border px-3.5 text-xs font-medium transition-colors duration-150 " +
        (active
          ? "border-primary bg-primary-soft text-primary"
          : "border-border-strong text-ink-secondary hover:border-ink-muted hover:text-ink")
      }
    >
      {label}
    </button>
  );
}
