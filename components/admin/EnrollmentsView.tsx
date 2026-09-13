"use client";

import { useMemo, useState } from "react";
import { ClipboardList } from "lucide-react";
import { COURSES } from "@/lib/data/demo/courses";
import { rosterForCourse } from "@/lib/data/demo/cohort";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { EmptyState } from "@/components/ui/EmptyState";

/**
 * Enrollment monitoring across the demo cohorts: who is enrolled where,
 * since when, and at what progress. Deterministic demo roster stands in for
 * the enrollments table a backend would provide.
 */
export function EnrollmentsView() {
  const [courseFilter, setCourseFilter] = useState<string>("all");

  const rows = useMemo(() => {
    const courses = courseFilter === "all" ? COURSES : COURSES.filter((c) => c.id === courseFilter);
    return courses.flatMap((course) =>
      rosterForCourse(course.id).map((trainee) => ({
        course,
        trainee,
        progress: trainee.progress[course.id] ?? 0,
        score: trainee.scores[course.id],
      }))
    );
  }, [courseFilter]);

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title="Enrollments"
        lead="Enrollment and progress across all course sections."
      />

      <div className="flex flex-wrap gap-1.5">
        <Chip label="All courses" active={courseFilter === "all"} onClick={() => setCourseFilter("all")} />
        {COURSES.map((course) => (
          <Chip
            key={course.id}
            label={`${course.code} · ${rosterForCourse(course.id).length}`}
            active={courseFilter === course.id}
            onClick={() => setCourseFilter(course.id)}
          />
        ))}
      </div>

      {rows.length === 0 ? (
        <EmptyState icon={ClipboardList} title="No enrollments" description="No cohort data for the selected course." />
      ) : (
        <Card className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr className="border-b border-border text-xs text-ink-muted">
                <th scope="col" className="px-5 py-3 font-medium">Trainee</th>
                <th scope="col" className="px-5 py-3 font-medium">Course</th>
                <th scope="col" className="px-5 py-3 font-medium">Enrolled</th>
                <th scope="col" className="px-5 py-3 font-medium">Status</th>
                <th scope="col" className="px-5 py-3 font-medium">Progress</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-border)] text-ink-secondary">
              {rows.map(({ course, trainee, progress, score }) => (
                <tr key={`${course.id}-${trainee.id}`}>
                  <td className="px-5 py-3">
                    <p className="font-medium text-ink">{trainee.name}</p>
                    <p className="text-xs text-ink-muted">{trainee.region}</p>
                  </td>
                  <td className="px-5 py-3">
                    <p className="font-mono text-xs tabular-nums text-ink">{course.code}</p>
                    <p className="text-xs text-ink-muted">{course.category}</p>
                  </td>
                  <td className="px-5 py-3 text-xs">
                    {new Date(course.addedAt).toLocaleDateString("en-IN", { month: "short", year: "numeric" })}
                  </td>
                  <td className="px-5 py-3">
                    {progress >= 100 ? (
                      <Badge tone="success">Completed</Badge>
                    ) : progress >= 50 ? (
                      <Badge tone="info">In progress</Badge>
                    ) : (
                      <Badge tone="warning">Just started</Badge>
                    )}
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2.5">
                      <ProgressBar value={progress} size="sm" className="w-24" />
                      <span className="font-mono text-xs tabular-nums text-ink">{progress}%</span>
                      {score !== undefined ? (
                        <Badge tone={score >= 60 ? "success" : "warning"}>{score}%</Badge>
                      ) : null}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  );
}

function Chip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
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
