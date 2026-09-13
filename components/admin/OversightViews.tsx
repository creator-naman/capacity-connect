"use client";

import { useMemo } from "react";
import { COURSES, COURSE_CATEGORIES } from "@/lib/data/demo/courses";
import { COHORT, participationFor, activeWithin } from "@/lib/data/demo/cohort";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

/** Bar rendered as a simple styled div — readable, theme-aware, no chart lib. */
function Bar({
  label,
  sub,
  value,
  suffix = "%",
  tone = "bg-accent",
}: {
  label: string;
  sub?: string;
  value: number;
  suffix?: string;
  tone?: string;
}) {
  return (
    <div className="flex items-center gap-4">
      <div className="w-44 shrink-0 sm:w-60">
        <p className="truncate text-sm font-medium text-ink">{label}</p>
        {sub ? <p className="text-[11px] text-ink-muted">{sub}</p> : null}
      </div>
      <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-surface-sunken">
        <div
          className={"h-full rounded-full transition-[width] duration-500 ease-out " + tone}
          style={{ width: `${Math.min(100, value)}%` }}
        />
      </div>
      <span className="w-12 shrink-0 text-right font-mono text-sm tabular-nums text-ink">
        {value}
        {suffix}
      </span>
    </div>
  );
}

/** Platform-wide participation statistics. */
export function ParticipationView() {
  const stats = useMemo(() => COURSES.map((course) => ({ course, s: participationFor(course) })), []);
  const { meanProgress, meanAttempt, activeLastWeek } = useMemo(() => {
    const active = COHORT.filter((t) => activeWithin(t.lastActiveAt, 7)).length;
    return {
      meanProgress: stats.length
        ? Math.round(stats.reduce((sum, { s }) => sum + s.meanProgress, 0) / stats.length)
        : 0,
      meanAttempt: stats.length
        ? Math.round(stats.reduce((sum, { s }) => sum + s.attemptRate, 0) / stats.length)
        : 0,
      activeLastWeek: active,
    };
  }, [stats]);

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title="Participation"
        lead="Cohort activity across the platform. Values are cohort means over the demo roster."
      />
      <Card className="flex flex-col gap-4 p-5">
        <Bar label="Mean module progress" sub="All sections" value={meanProgress} />
        <Bar label="Assessment attempt rate" sub="Share of roster attempting" value={meanAttempt} tone="bg-primary" />
        <Bar
          label="Active in the last 7 days"
          sub={`${activeLastWeek} of ${COHORT.length} cohort members`}
          value={Math.round((activeLastWeek / COHORT.length) * 100)}
          tone="bg-info"
        />
      </Card>

      <Card className="divide-y divide-[var(--color-border)]">
        {stats.map(({ course, s }) => (
          <div key={course.id} className="px-5 py-3.5">
            <Bar
              label={course.title}
              sub={`${course.code} · ${s.traineeCount} trainees${s.atRiskCount > 0 ? ` · ${s.atRiskCount} inactive` : ""}`}
              value={s.meanProgress}
            />
          </div>
        ))}
      </Card>
    </div>
  );
}

/** Platform analytics overview: catalog distribution and outcome aggregates. */
export function AnalyticsView() {
  const byCategory = useMemo(
    () =>
      COURSE_CATEGORIES.map((category) => ({
        category,
        count: COURSES.filter((c) => c.category === category).length,
      })),
    []
  );
  const stats = useMemo(() => COURSES.map((course) => ({ course, s: participationFor(course) })), []);
  const meanScore = (() => {
    const scores = stats.map(({ s }) => s.meanScore).filter((v) => v > 0);
    return scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
  })();
  const completion = stats.length
    ? Math.round(stats.reduce((sum, { s }) => sum + s.completionRate, 0) / stats.length)
    : 0;

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title="Analytics"
        lead="Catalog composition and outcome aggregates. No invented statistics — all values derive from the demo data."
      />

      <section aria-labelledby="catalog-mix" className="flex flex-col gap-3">
        <h2 id="catalog-mix" className="text-sm font-semibold text-ink">
          Catalog mix by category
        </h2>
        <Card className="flex flex-col gap-4 p-5">
          {byCategory.map(({ category, count }) => (
            <Bar
              key={category}
              label={category}
              sub={`${count} course${count === 1 ? "" : "s"}`}
              value={Math.round((count / COURSES.length) * 100)}
              tone="bg-primary"
            />
          ))}
        </Card>
      </section>

      <section aria-labelledby="outcomes" className="flex flex-col gap-3">
        <h2 id="outcomes" className="text-sm font-semibold text-ink">
          Learning outcomes
        </h2>
        <Card className="flex flex-col gap-4 p-5">
          <Bar label="Mean assessment score" sub="Across courses with attempts" value={meanScore} tone="bg-info" />
          <Bar label="Course completion rate" sub="Trainees finishing all modules" value={completion} />
        </Card>
      </section>

      <section aria-labelledby="flags" className="flex flex-col gap-3">
        <h2 id="flags" className="text-sm font-semibold text-ink">
        Courses needing attention
        </h2>
        <Card className="divide-y divide-[var(--color-border)]">
          {stats
            .filter(({ s }) => s.atRiskCount > 0 || s.meanProgress < 45)
            .map(({ course, s }) => (
              <div key={course.id} className="flex flex-wrap items-center gap-2 px-5 py-3.5">
                <p className="min-w-0 flex-1 truncate text-sm font-medium text-ink">{course.title}</p>
                <p className="text-xs text-ink-muted">
                  mean {s.meanProgress}%{s.atRiskCount > 0 ? ` · ${s.atRiskCount} inactive` : ""}
                </p>
                <Badge tone="warning">Review</Badge>
              </div>
            ))}
          {stats.every(({ s }) => s.atRiskCount === 0 && s.meanProgress >= 45) ? (
            <div className="px-5 py-4">
              <p className="text-sm text-ink-secondary">All cohorts are on track.</p>
            </div>
          ) : null}
        </Card>
      </section>
    </div>
  );
}
