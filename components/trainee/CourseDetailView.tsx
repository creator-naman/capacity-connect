"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  ArrowLeft,
  BookOpen,
  Clock,
  CalendarDays,
  FileText,
  Presentation,
  MonitorPlay,
  Database,
  BookMarked,
  CircleCheck,
  Target,
  ClipboardCheck,
} from "lucide-react";
import type { LearningResource } from "@/lib/types/domain";
import { getAssessmentForCourse } from "@/lib/data/demo/assessments";
import { useDemoStore } from "@/lib/store/demo-store";
import { buttonClassName } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { formatDate, formatMinutes } from "@/lib/format";

const levelTone = {
  beginner: "success",
  intermediate: "info",
  advanced: "warning",
} as const;

const resourceIcon = {
  "recorded-lecture": MonitorPlay,
  presentation: Presentation,
  "study-material": FileText,
  dataset: Database,
  reference: BookMarked,
} as const;

/**
 * Course detail + enrollment entry point. The learning workspace itself
 * lives in My Learning once enrolled; this page is discovery and decision.
 */
export function CourseDetailView({ courseId }: { courseId: string }) {
  const router = useRouter();
  const { state, hydrated, enroll, findCourse } = useDemoStore();
  const course = findCourse(courseId);
  const [confirming, setConfirming] = useState(false);

  if (!hydrated) {
    return (
      <div className="flex flex-col gap-4" role="status" aria-label="Loading">
        <span className="sr-only">Loading…</span>
        <div className="h-5 w-24 animate-pulse rounded-[var(--radius-sm)] bg-surface-sunken" />
        <div className="h-8 w-2/3 animate-pulse rounded-[var(--radius-sm)] bg-surface-sunken" />
        <div className="h-40 animate-pulse rounded-[var(--radius-md)] bg-surface-sunken" />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="flex flex-col items-center gap-4 py-16 text-center">
        <p className="text-sm font-semibold text-ink">Course not found</p>
        <Link href="/trainee/explore" className={buttonClassName("secondary", "sm")}>
          Back to Explore
        </Link>
      </div>
    );
  }

  const enrollment = state.enrollments.find((e) => e.courseId === course.id);
  const best = state.quizResults
    .filter((r) => r.courseId === course.id)
    .sort((a, b) => b.score - a.score)[0];
  const progress = enrollment
    ? (enrollment.completedModules.length / course.modules.length) * 100
    : 0;
  const assessment = getAssessmentForCourse(course.id);
  const trainer = course.trainerName;

  const handleEnroll = () => {
    enroll(course.id);
    setConfirming(false);
    router.push("/trainee/my-learning");
  };

  return (
    <div className="flex flex-col gap-6">
      <Link
        href="/trainee/explore"
        className="flex w-fit items-center gap-1.5 text-sm text-ink-secondary transition-colors hover:text-ink"
      >
        <ArrowLeft size={15} strokeWidth={1.75} />
        Explore Courses
      </Link>

      {/* Header */}
      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <Badge tone="neutral">{course.code}</Badge>
          <Badge tone={levelTone[course.level]}>{course.level}</Badge>
          <Badge tone="info">{course.category}</Badge>
          {enrollment?.status === "completed" ? <Badge tone="success">Completed</Badge> : null}
          {enrollment?.status === "active" ? <Badge tone="accent">Enrolled</Badge> : null}
        </div>
        <h1 className="text-2xl font-semibold leading-tight text-ink">{course.title}</h1>
        <p className="max-w-3xl text-sm leading-relaxed text-ink-secondary">{course.description}</p>
        <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 text-xs text-ink-muted">
          <span>{trainer}</span>
          <span className="flex items-center gap-1.5">
            <BookOpen size={13} strokeWidth={1.75} />
            {course.modules.length} modules
          </span>
          <span className="flex items-center gap-1.5">
            <Clock size={13} strokeWidth={1.75} />
            {course.hours} hours
          </span>
          <span className="flex items-center gap-1.5">
            <CalendarDays size={13} strokeWidth={1.75} />
            Added {formatDate(course.addedAt)}
          </span>
        </div>
      </div>

      {/* Enrollment / continue panel */}
      {enrollment ? (
        <Card className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-ink">
              {enrollment.status === "completed"
                ? "Course completed — nice work."
                : "You are enrolled in this course."}
            </p>
            <ProgressBar
              value={progress}
              label="Your progress"
              size="sm"
              className="mt-2.5 max-w-sm"
            />
            {best ? (
              <p className="mt-2 text-xs text-ink-muted">
                Best assessment score:{" "}
                <span className={"font-mono tabular-nums " + (best.passed ? "text-success" : "text-warning")}>
                  {best.score}%
                </span>{" "}
                {best.passed ? "(passed)" : `(pass mark ${assessment?.passMark ?? 60}%)`}
              </p>
            ) : null}
          </div>
          <div className="flex shrink-0 items-center gap-2">
            {assessment ? (
              <Link
                href={`/trainee/assessments/${assessment.id}`}
                className={buttonClassName("secondary", "sm") + " gap-1.5"}
              >
                <ClipboardCheck size={14} strokeWidth={1.75} />
                Assessment
              </Link>
            ) : null}
            <Link href="/trainee/my-learning" className={buttonClassName("primary", "sm")}>
              {enrollment.status === "completed" ? "Review course" : "Continue learning"}
            </Link>
          </div>
        </Card>
      ) : confirming ? (
        <Card className="flex flex-col gap-3 border-primary/40 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-ink">Enroll in {course.code}?</p>
            <p className="mt-0.5 text-xs text-ink-secondary">
              The course appears in My Learning immediately. You can leave modules and resume anytime.
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <button
              type="button"
              className={buttonClassName("ghost", "sm")}
              onClick={() => setConfirming(false)}
            >
              Cancel
            </button>
            <button type="button" className={buttonClassName("primary", "sm")} onClick={handleEnroll}>
              Confirm enrollment
            </button>
          </div>
        </Card>
      ) : (
        <div className="flex items-center gap-3">
          <button type="button" className={buttonClassName("primary", "md")} onClick={() => setConfirming(true)}>
            Enroll in this course
          </button>
          <span className="text-xs text-ink-muted">Free for IMD training cohorts</span>
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-[1fr_260px]">
        {/* Curriculum */}
        <section aria-labelledby="curriculum" className="flex flex-col gap-3">
          <h2 id="curriculum" className="text-sm font-semibold text-ink">
            Curriculum
          </h2>
          <Card className="divide-y divide-[var(--color-border)]">
            {course.modules.map((module, index) => (
              <div key={module.id} className="flex flex-col gap-2.5 px-5 py-4">
                <div className="flex items-start gap-3">
                  <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-surface-sunken font-mono text-[11px] tabular-nums text-ink-secondary">
                    {index + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-ink">{module.title}</p>
                    <p className="mt-0.5 text-xs leading-relaxed text-ink-secondary">{module.summary}</p>
                  </div>
                  <span className="shrink-0 font-mono text-[11px] tabular-nums text-ink-muted">
                    {formatMinutes(module.minutes)}
                  </span>
                </div>
                {module.resources.length > 0 ? (
                  <ul className="ml-9 flex flex-col gap-1.5">
                    {module.resources.map((resource) => (
                      <li key={resource.id} className="flex items-center gap-2 text-xs text-ink-secondary">
                        <ResourceGlyph resource={resource} />
                        <span className="truncate">{resource.title}</span>
                        <Badge tone="neutral" className="ml-auto shrink-0">
                          {resource.format}
                        </Badge>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </div>
            ))}
          </Card>
        </section>

        {/* Outcomes */}
        <section aria-labelledby="outcomes" className="flex flex-col gap-3">
          <h2 id="outcomes" className="text-sm font-semibold text-ink">
            What you will be able to do
          </h2>
          <Card className="p-5">
            <ul className="flex flex-col gap-3">
              {course.outcomes.map((outcome) => (
                <li key={outcome} className="flex items-start gap-2.5 text-sm text-ink-secondary">
                  <Target size={15} strokeWidth={1.75} className="mt-0.5 shrink-0 text-accent" />
                  <span className="leading-relaxed">{outcome}</span>
                </li>
              ))}
            </ul>
          </Card>
          {assessment ? (
            <Card className="flex items-start gap-2.5 p-4">
              <CircleCheck size={15} strokeWidth={1.75} className="mt-0.5 shrink-0 text-info" />
              <p className="text-xs leading-relaxed text-ink-secondary">
                Ends with a subject assessment: {assessment.questions.length} questions, pass mark{" "}
                {assessment.passMark}%, {assessment.timeLimitMinutes} minutes. Passing plus completed
                modules earns a certificate.
              </p>
            </Card>
          ) : null}
        </section>
      </div>
    </div>
  );
}

function ResourceGlyph({ resource }: { resource: LearningResource }) {
  const Icon = resourceIcon[resource.kind] ?? FileText;
  return <Icon size={13} strokeWidth={1.75} className="shrink-0 text-ink-muted" />;
}
