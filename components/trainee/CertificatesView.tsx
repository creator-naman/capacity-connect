"use client";

import Link from "next/link";
import { useMemo } from "react";
import { Award, ClipboardCheck, Compass, ShieldCheck } from "lucide-react";
import { getCourse } from "@/lib/data/demo/courses";
import { getAssessmentForCourse } from "@/lib/data/demo/assessments";
import { useDemoStore, isCourseComplete } from "@/lib/store/demo-store";
import { PageHeader } from "@/components/ui/PageHeader";
import { PageSkeleton } from "@/components/ui/Skeleton";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { buttonClassName } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatDate } from "@/lib/format";

/**
 * Earned certificates plus the certification path for in-progress courses:
 * what's done, what's missing, and the direct action to close the gap.
 */
export function CertificatesView() {
  const { state, hydrated } = useDemoStore();

  const inProgress = useMemo(() => {
    return state.enrollments
      .filter((e) => !state.certificates.some((c) => c.courseId === e.courseId))
      .map((enrollment) => {
        const course = getCourse(enrollment.courseId)!;
        const assessment = getAssessmentForCourse(enrollment.courseId);
        const best = state.quizResults
          .filter((r) => r.courseId === enrollment.courseId)
          .sort((a, b) => b.score - a.score)[0];
        const modulesDone = isCourseComplete(enrollment, course?.modules.length ?? 0);
        return { enrollment, course, assessment, best, modulesDone };
      })
      .filter((entry) => entry.course);
  }, [state.enrollments, state.certificates, state.quizResults]);

  if (!hydrated) return <PageSkeleton withStats={false} />;

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title="Certificates"
        lead="Completion certificates issued for finished courses. Verified against your assessment record."
      />

      {state.certificates.length === 0 ? (
        <EmptyState
          icon={Award}
          title="No certificates yet"
          description="Complete all modules of a course and pass its assessment to earn your first certificate."
          action={
            <Link href="/trainee/my-learning" className={buttonClassName("primary", "sm")}>
              Go to My Learning
            </Link>
          }
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {state.certificates.map((certificate) => (
            <Card key={certificate.id} className="flex flex-col gap-3 p-5">
              <div className="flex items-start justify-between gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-[var(--radius-sm)] bg-accent-soft text-accent">
                  <ShieldCheck size={20} strokeWidth={1.75} />
                </span>
                <Badge tone="success">Issued</Badge>
              </div>
              <div>
                <p className="font-mono text-[11px] tabular-nums text-ink-muted">{certificate.id}</p>
                <h2 className="mt-0.5 text-base font-semibold leading-snug text-ink">
                  {certificate.courseTitle}
                </h2>
              </div>
              <dl className="flex flex-col gap-1.5 border-t border-border pt-3 text-xs">
                <div className="flex justify-between">
                  <dt className="text-ink-muted">Awarded to</dt>
                  <dd className="font-medium text-ink">{certificate.traineeName}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-ink-muted">Assessment score</dt>
                  <dd className="font-mono tabular-nums text-ink">{certificate.score}%</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-ink-muted">Issued</dt>
                  <dd className="text-ink">{formatDate(certificate.issuedAt)}</dd>
                </div>
              </dl>
            </Card>
          ))}
        </div>
      )}

      {inProgress.length > 0 ? (
        <section aria-labelledby="certification-path">
          <h2 id="certification-path" className="mb-3 text-sm font-semibold text-ink">
            Working towards certification
          </h2>
          <Card className="divide-y divide-[var(--color-border)]">
            {inProgress.map(({ enrollment, course, assessment, best, modulesDone }) => (
              <div key={enrollment.courseId} className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-ink">{course.title}</p>
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <Badge tone={modulesDone ? "success" : "neutral"}>
                      {modulesDone ? "Modules complete" : `${enrollment.completedModules.length}/${course.modules.length} modules`}
                    </Badge>
                    <Badge tone={best?.passed ? "success" : "warning"}>
                      {best?.passed
                        ? `Assessment passed · ${best.score}%`
                        : best
                          ? `Best attempt ${best.score}%`
                          : "Assessment pending"}
                    </Badge>
                  </div>
                  {!modulesDone ? (
                    <ProgressBar
                      value={(enrollment.completedModules.length / course.modules.length) * 100}
                      size="sm"
                      className="mt-2.5 max-w-xs"
                    />
                  ) : null}
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  {!modulesDone ? (
                    <Link href="/trainee/my-learning" className={buttonClassName("secondary", "sm")}>
                      Finish modules
                    </Link>
                  ) : assessment && !best?.passed ? (
                    <Link href={`/trainee/assessments/${assessment.id}`} className={buttonClassName("primary", "sm")}>
                      <ClipboardCheck size={14} strokeWidth={1.75} />
                      Take assessment
                    </Link>
                  ) : null}
                </div>
              </div>
            ))}
          </Card>
        </section>
      ) : null}

      {state.certificates.length === 0 && inProgress.length === 0 ? (
        <EmptyState
          icon={Compass}
          title="Nothing in progress"
          description="Enroll in a course to begin working towards a certificate."
          action={
            <Link href="/trainee/explore" className={buttonClassName("primary", "sm")}>
              Explore courses
            </Link>
          }
        />
      ) : null}
    </div>
  );
}
