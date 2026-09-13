"use client";

import { useMemo } from "react";
import { Activity } from "lucide-react";
import { ASSESSMENTS } from "@/lib/data/demo/assessments";
import { COURSES } from "@/lib/data/demo/courses";
import { rosterForCourse } from "@/lib/data/demo/cohort";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";

/** Assessment monitoring: participation and outcome distribution per subject. */
export function AssessmentsAdminView() {
  const rows = useMemo(
    () =>
      ASSESSMENTS.map((assessment) => {
        const course = COURSES.find((c) => c.id === assessment.courseId);
        const roster = rosterForCourse(assessment.courseId);
        const attempted = roster.filter((t) => t.scores[assessment.courseId] !== undefined);
        const scores = attempted.map((t) => t.scores[assessment.courseId]!);
        const mean = scores.length
          ? Math.round(scores.reduce((s, v) => s + v, 0) / scores.length)
          : 0;
        const passed = scores.filter((s) => s >= assessment.passMark).length;
        return { assessment, course, rosterSize: roster.length, attempted: attempted.length, mean, passed };
      }),
    []
  );

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title="Assessments"
        lead="Subject-wise participation and outcomes across the cohorts."
      />

      <Card className="overflow-x-auto">
        <table className="w-full min-w-[680px] text-left text-sm">
          <thead>
            <tr className="border-b border-border text-xs text-ink-muted">
              <th scope="col" className="px-5 py-3 font-medium">Assessment</th>
              <th scope="col" className="px-5 py-3 font-medium">Course</th>
              <th scope="col" className="px-5 py-3 font-medium">Pass mark</th>
              <th scope="col" className="px-5 py-3 font-medium">Attempted</th>
              <th scope="col" className="px-5 py-3 font-medium">Mean score</th>
              <th scope="col" className="px-5 py-3 font-medium">Pass rate</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--color-border)] text-ink-secondary">
            {rows.map(({ assessment, course, rosterSize, attempted, mean, passed }) => (
              <tr key={assessment.id}>
                <td className="px-5 py-3.5">
                  <p className="font-medium text-ink">{assessment.title}</p>
                  <p className="text-xs text-ink-muted">{assessment.subject}</p>
                </td>
                <td className="px-5 py-3.5 font-mono text-xs tabular-nums">{course?.code}</td>
                <td className="px-5 py-3.5 font-mono text-xs tabular-nums">{assessment.passMark}%</td>
                <td className="px-5 py-3.5 font-mono text-xs tabular-nums">
                  {attempted}/{rosterSize}
                </td>
                <td className="px-5 py-3.5 font-mono text-xs tabular-nums">{mean ? `${mean}%` : "—"}</td>
                <td className="px-5 py-3.5">
                  {attempted > 0 ? (
                    <Badge tone={passed / attempted >= 0.6 ? "success" : "warning"}>
                      {Math.round((passed / attempted) * 100)}%
                    </Badge>
                  ) : (
                    <Badge tone="neutral">No attempts</Badge>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      {rows.length === 0 ? (
        <EmptyState icon={Activity} title="No assessments" description="No subject assessments are configured." />
      ) : null}
    </div>
  );
}
