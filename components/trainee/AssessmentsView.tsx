"use client";

import Link from "next/link";
import { useMemo } from "react";
import { ClipboardCheck, Compass, CircleCheck, ArrowRight } from "lucide-react";
import { ASSESSMENTS } from "@/lib/data/demo/assessments";
import { useDemoStore } from "@/lib/store/demo-store";
import { PageHeader } from "@/components/ui/PageHeader";
import { PageSkeleton } from "@/components/ui/Skeleton";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { buttonClassName } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatDateTime } from "@/lib/format";

/**
 * Subject-wise MCQ assessments for enrolled courses, plus attempt history.
 * The runner lives at /trainee/assessments/[assessmentId].
 */
export function AssessmentsView() {
  const { state, hydrated, findCourse } = useDemoStore();

  const rows = useMemo(() => {
    return ASSESSMENTS.map((assessment) => {
      const course = findCourse(assessment.courseId);
      const enrollment = state.enrollments.find((e) => e.courseId === assessment.courseId);
      const attempts = state.quizResults
        .filter((r) => r.assessmentId === assessment.id)
        .sort((a, b) => (a.attemptedAt < b.attemptedAt ? 1 : -1));
      const best = attempts.slice().sort((a, b) => b.score - a.score)[0];
      return { assessment, course, enrollment, attempts, best };
    });
  }, [state.quizResults, state.enrollments, findCourse]);

  const available = rows.filter((r) => r.enrollment);
  const history = rows.flatMap((r) =>
    r.attempts.map((attempt, index) => ({ ...r, attempt, isLatest: index === 0 }))
  );

  if (!hydrated) return <PageSkeleton withStats={false} />;

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title="Assessments"
        lead="Subject-wise MCQ assessments. Passing a course assessment plus completing its modules earns a certificate."
      />

      {available.length === 0 ? (
        <EmptyState
          icon={Compass}
          title="No assessments available"
          description="Assessments unlock once you enroll in a course. Explore the catalog to get started."
          action={
            <Link href="/trainee/explore" className={buttonClassName("primary", "sm")}>
              Explore courses
            </Link>
          }
        />
      ) : (
        <section aria-labelledby="available-assessments">
          <h2 id="available-assessments" className="mb-3 text-sm font-semibold text-ink">
            Your assessments
          </h2>
          <Card className="divide-y divide-[var(--color-border)]">
            {available.map(({ assessment, course, best }) => (
              <div key={assessment.id} className="flex items-center gap-3.5 px-5 py-4">
                <span
                  className={
                    "flex h-9 w-9 shrink-0 items-center justify-center rounded-[var(--radius-sm)] " +
                    (best?.passed ? "bg-success-soft text-success" : "bg-warning-soft text-warning")
                  }
                >
                  {best?.passed ? (
                    <CircleCheck size={18} strokeWidth={1.75} />
                  ) : (
                    <ClipboardCheck size={18} strokeWidth={1.75} />
                  )}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-ink">{assessment.title}</p>
                  <p className="truncate text-xs text-ink-muted">
                    {course?.code} · {assessment.questions.length} questions · pass mark{" "}
                    {assessment.passMark}% · {assessment.timeLimitMinutes} min
                    {best ? ` · best ${best.score}%` : ""}
                  </p>
                </div>
                {best?.passed ? <Badge tone="success">Passed</Badge> : null}
                <Link
                  href={`/trainee/assessments/${assessment.id}`}
                  className={buttonClassName("secondary", "sm")}
                >
                  {best ? "Retake" : "Take"}
                </Link>
              </div>
            ))}
          </Card>
        </section>
      )}

      <section aria-labelledby="results-history">
        <h2 id="results-history" className="mb-3 text-sm font-semibold text-ink">
          Results history
        </h2>
        {history.length === 0 ? (
          <Card className="p-5">
            <p className="text-sm text-ink-muted">
              No attempts yet. Your scores will appear here after you take an assessment.
            </p>
          </Card>
        ) : (
          <Card className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-border text-xs text-ink-muted">
                  <th scope="col" className="px-5 py-3 font-medium">Assessment</th>
                  <th scope="col" className="px-5 py-3 font-medium">Attempt</th>
                  <th scope="col" className="px-5 py-3 font-medium">Score</th>
                  <th scope="col" className="px-5 py-3 font-medium">Outcome</th>
                  <th scope="col" className="px-5 py-3 font-medium">When</th>
                  <th scope="col" className="px-5 py-3"><span className="sr-only">Actions</span></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-border)]">
                {history.map(({ assessment, course, attempt }) => (
                  <tr key={attempt.assessmentId + attempt.attemptedAt} className="text-ink-secondary">
                    <td className="max-w-[220px] truncate px-5 py-3 text-ink">{assessment.title}</td>
                    <td className="px-5 py-3 text-xs">{course?.code}</td>
                    <td className="px-5 py-3 font-mono tabular-nums text-ink">{attempt.score}%</td>
                    <td className="px-5 py-3">
                      {attempt.passed ? (
                        <Badge tone="success">Passed</Badge>
                      ) : (
                        <Badge tone="error">Below {ASSESSMENTS.find((a) => a.id === attempt.assessmentId)?.passMark ?? 60}%</Badge>
                      )}
                    </td>
                    <td className="whitespace-nowrap px-5 py-3 text-xs">{formatDateTime(attempt.attemptedAt)}</td>
                    <td className="px-5 py-3 text-right">
                      <Link
                        href={`/trainee/assessments/${assessment.id}`}
                        className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
                      >
                        Review
                        <ArrowRight size={12} strokeWidth={2} />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        )}
      </section>
    </div>
  );
}
