"use client";

import { useMemo } from "react";
import { Award } from "lucide-react";
import { COURSES } from "@/lib/data/demo/courses";
import { getAssessmentForCourse } from "@/lib/data/demo/assessments";
import { rosterForCourse } from "@/lib/data/demo/cohort";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";

/**
 * Certification monitoring. Certification follows the platform rule — all
 * modules complete plus a passed assessment — applied to the deterministic
 * demo cohorts (a backend replaces this derivation).
 */
export function CertificationsView() {
  const rows = useMemo(() => {
    return COURSES.flatMap((course) => {
      const assessment = getAssessmentForCourse(course.id);
      const passMark = assessment?.passMark ?? 60;
      return rosterForCourse(course.id).map((trainee) => {
        const progress = trainee.progress[course.id] ?? 0;
        const score = trainee.scores[course.id];
        const modulesDone = progress >= 100;
        const passed = score !== undefined && score >= passMark;
        return {
          trainee,
          course,
          score,
          modulesDone,
          passed,
          status: modulesDone && passed ? "issued" : modulesDone ? "assessment-pending" : "in-progress",
        } as const;
      });
    }).sort((a, b) => (a.status === b.status ? b.score ?? 0 - (a.score ?? 0) : a.status === "issued" ? -1 : 1));
  }, []);

  const counts = useMemo(
    () => ({
      issued: rows.filter((r) => r.status === "issued").length,
      pending: rows.filter((r) => r.status === "assessment-pending").length,
      inProgress: rows.filter((r) => r.status === "in-progress").length,
    }),
    [rows]
  );

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title="Certifications"
        lead="Certificates follow the platform rule: all modules complete plus a passed assessment."
      />

      <div className="flex flex-wrap gap-2">
        <Badge tone="success">{counts.issued} issued</Badge>
        <Badge tone="warning">{counts.pending} awaiting assessment</Badge>
        <Badge tone="neutral">{counts.inProgress} in progress</Badge>
      </div>

      {rows.length === 0 ? (
        <EmptyState icon={Award} title="No certification activity" description="Cohort members appear here as they complete courses." />
      ) : (
        <Card className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr className="border-b border-border text-xs text-ink-muted">
                <th scope="col" className="px-5 py-3 font-medium">Trainee</th>
                <th scope="col" className="px-5 py-3 font-medium">Course</th>
                <th scope="col" className="px-5 py-3 font-medium">Best score</th>
                <th scope="col" className="px-5 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-border)] text-ink-secondary">
              {rows.map(({ trainee, course, score, status }) => (
                <tr key={`${course.id}-${trainee.id}`}>
                  <td className="px-5 py-3">
                    <p className="font-medium text-ink">{trainee.name}</p>
                    <p className="text-xs text-ink-muted">{trainee.region}</p>
                  </td>
                  <td className="px-5 py-3">
                    <p className="font-mono text-xs tabular-nums text-ink">{course.code}</p>
                  </td>
                  <td className="px-5 py-3 font-mono text-xs tabular-nums">
                    {score !== undefined ? `${score}%` : "—"}
                  </td>
                  <td className="px-5 py-3">
                    {status === "issued" ? (
                      <Badge tone="success">Certified</Badge>
                    ) : status === "assessment-pending" ? (
                      <Badge tone="warning">Assessment pending</Badge>
                    ) : (
                      <Badge tone="neutral">In progress</Badge>
                    )}
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
