"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  BookOpen,
  ClipboardCheck,
  Award,
  FilePen,
  CircleCheck,
  ArrowRight,
  Bell,
  Flame,
  Hourglass,
  Sparkle,
} from "lucide-react";
import { useDemoStore, bestResult } from "@/lib/store/demo-store";
import { ASSESSMENTS } from "@/lib/data/demo/assessments";
import { QUESTIONNAIRES } from "@/lib/data/demo/portal";
import { PageSkeleton } from "@/components/ui/Skeleton";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatCard } from "@/components/ui/StatCard";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Button, buttonClassName } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Textarea";
import { EmptyState } from "@/components/ui/EmptyState";
import { Modal } from "@/components/ui/Modal";
import { formatDateTime, relativeDays } from "@/lib/format";
import type { Course, Questionnaire } from "@/lib/types/domain";

/** Collects questionnaire responses with the deadline shown up front. */
function QuestionnaireModal({
  questionnaire,
  open,
  onClose,
  onSubmit,
}: {
  questionnaire: Questionnaire;
  open: boolean;
  onClose: () => void;
  onSubmit: (answers: Record<string, string>) => void;
}) {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | undefined>();

  const submit = () => {
    const missing = questionnaire.questions.filter((q) => !answers[q.id]?.trim());
    if (missing.length > 0) {
      setError("Please respond to every question before submitting.");
      return;
    }
    setError(undefined);
    onSubmit(answers);
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={questionnaire.title}
      footer={
        <>
          <Button variant="ghost" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button size="sm" onClick={submit}>
            Submit responses
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <p className="text-sm leading-relaxed text-ink-secondary">{questionnaire.description}</p>
        <p className="flex items-center gap-1.5 text-xs font-medium text-warning">
          <Hourglass size={13} strokeWidth={1.75} />
          Due {relativeDays(questionnaire.deadline)} · {questionnaire.trainerName}
        </p>
        {error ? (
          <p role="alert" className="rounded-[var(--radius-sm)] bg-error-soft px-3 py-2 text-sm text-error">
            {error}
          </p>
        ) : null}
        {questionnaire.questions.map((question, index) => (
          <div key={question.id} className="flex flex-col gap-1.5">
            <label htmlFor={`qq-${question.id}`} className="text-sm font-medium text-ink">
              {index + 1}. {question.prompt}
            </label>
            {question.type === "choice" ? (
              <select
                id={`qq-${question.id}`}
                value={answers[question.id] ?? ""}
                onChange={(event) =>
                  setAnswers((prev) => ({ ...prev, [question.id]: event.target.value }))
                }
                className="h-10 w-full rounded-[var(--radius-sm)] border border-border-strong bg-surface px-3 text-sm text-ink focus:border-primary focus:outline-none"
              >
                <option value="" disabled>
                  Select an option
                </option>
                {question.options?.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            ) : question.type === "rating" ? (
              <div className="flex gap-1.5" role="radiogroup" aria-label={question.prompt}>
                {[1, 2, 3, 4, 5].map((rating) => (
                  <button
                    key={rating}
                    type="button"
                    role="radio"
                    aria-checked={answers[question.id] === String(rating)}
                    onClick={() => setAnswers((prev) => ({ ...prev, [question.id]: String(rating) }))}
                    className={
                      "h-9 w-9 rounded-[var(--radius-sm)] border font-mono text-sm tabular-nums transition-colors " +
                      (answers[question.id] === String(rating)
                        ? "border-primary bg-primary-soft text-primary"
                        : "border-border-strong text-ink-secondary hover:border-ink-muted")
                    }
                  >
                    {rating}
                  </button>
                ))}
              </div>
            ) : (
              <Textarea
                label=""
                rows={3}
                className="mt-0"
                onChange={(event) =>
                  setAnswers((prev) => ({ ...prev, [question.id]: event.target.value }))
                }
              />
            )}
          </div>
        ))}
      </div>
    </Modal>
  );
}

export function DashboardView({ firstName }: { firstName: string }) {
  const { state, hydrated, findCourse, allCourses } = useDemoStore();

  const derived = useMemo(() => {
    const enrolledActive = state.enrollments.filter((e) => e.status === "active");
    const completed = state.enrollments.filter((e) => e.status === "completed");

    const progressOf = (courseId: string) => {
      const course = findCourse(courseId);
      const enrollment = state.enrollments.find((e) => e.courseId === courseId);
      if (!course || !enrollment) return 0;
      return (enrollment.completedModules.length / course.modules.length) * 100;
    };

    // Most recently touched in-progress course becomes "continue learning".
    const continueCourse = enrolledActive
      .map((e) => ({ course: findCourse(e.courseId)!, enrollment: e, progress: progressOf(e.courseId) }))
      .filter((entry) => entry.course)
      .sort((a, b) => (a.enrollment.enrolledAt < b.enrollment.enrolledAt ? 1 : -1))[0];

    // Assessments for enrolled courses not yet passed.
    const passedCourseIds = new Set(
      state.quizResults.filter((r) => r.passed).map((r) => r.courseId)
    );
    const pendingAssessments = ASSESSMENTS.filter(
      (a) =>
        state.enrollments.some((e) => e.courseId === a.courseId) &&
        !passedCourseIds.has(a.courseId)
    );

    const submittedQuestionnaireIds = new Set(
      state.questionnaireResponses.map((r) => r.questionnaireId)
    );
    const upcomingQuestionnaires = QUESTIONNAIRES.filter(
      (q) => !submittedQuestionnaireIds.has(q.id)
    ).sort((a, b) => (a.deadline < b.deadline ? -1 : 1));

    const unreadCount = state.notifications.filter((n) => !n.read).length;

    return {
      enrolledActive,
      completed,
      progressOf,
      continueCourse,
      pendingAssessments,
      upcomingQuestionnaires,
      unreadCount,
    };
  }, [state, findCourse]);

  if (!hydrated) return <PageSkeleton />;

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={`${greeting}, ${firstName}`}
        lead="Here's where your learning stands today."
        actions={
          derived.unreadCount > 0 ? (
            <Link href="/trainee/notifications" className={buttonClassName("secondary", "sm") + " gap-1.5"}>
              <Bell size={14} strokeWidth={1.75} />
              {derived.unreadCount} new
            </Link>
          ) : undefined
        }
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard icon={BookOpen} tone="primary" value={derived.enrolledActive.length} label="In progress" href="/trainee/my-learning" />
        <StatCard icon={CircleCheck} tone="accent" value={derived.completed.length} label="Completed" href="/trainee/my-learning" />
        <StatCard icon={ClipboardCheck} tone="warning" value={derived.pendingAssessments.length} label="Assessments due" href="/trainee/assessments" />
        <StatCard icon={Award} value={state.certificates.length} label="Certificates" href="/trainee/certificates" />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Continue learning */}
        <section aria-labelledby="continue-learning">
          <div className="mb-3 flex items-center justify-between">
            <h2 id="continue-learning" className="text-sm font-semibold text-ink">
              Continue learning
            </h2>
            <Link href="/trainee/my-learning" className="text-xs font-medium text-primary hover:underline">
              My Learning
            </Link>
          </div>
          {derived.continueCourse ? (
            <Card className="p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <Badge tone="neutral">{derived.continueCourse.course.code}</Badge>
                  <h3 className="mt-2 text-base font-semibold leading-snug text-ink">
                    {derived.continueCourse.course.title}
                  </h3>
                  <p className="mt-1 text-xs text-ink-muted">
                    Next up: {derived.continueCourse.course.modules.find((m) => m.id === derived.continueCourse!.enrollment.lastModuleId)?.title ?? "Pick any module"}
                  </p>
                </div>
                <span className="font-mono text-lg tabular-nums text-ink-secondary">
                  {Math.round(derived.continueCourse.progress)}%
                </span>
              </div>
              <ProgressBar value={derived.continueCourse.progress} className="mt-4" />
              <div className="mt-4 flex items-center gap-2">
                <Link href="/trainee/my-learning" className={buttonClassName("primary", "sm") + " gap-1.5"}>
                  Resume
                  <ArrowRight size={14} strokeWidth={2} />
                </Link>
                <span className="text-xs text-ink-muted">
                  {derived.continueCourse.course.trainerName}
                </span>
              </div>
            </Card>
          ) : (
            <EmptyState
              icon={BookOpen}
              title="No active courses"
              description="Browse the catalog and enroll in a course to start building capability."
              action={
                <Link href="/trainee/explore" className={buttonClassName("primary", "sm")}>
                  Explore courses
                </Link>
              }
            />
          )}
        </section>

        {/* Pending assessments + upcoming */}
        <section aria-labelledby="pending-items">
          <div className="mb-3 flex items-center justify-between">
            <h2 id="pending-items" className="text-sm font-semibold text-ink">
              Pending &amp; upcoming
            </h2>
            <Link href="/trainee/assessments" className="text-xs font-medium text-primary hover:underline">
              All assessments
            </Link>
          </div>
          <Card className="divide-y divide-[var(--color-border)]">
            {derived.pendingAssessments.length === 0 && derived.upcomingQuestionnaires.length === 0 ? (
              <div className="p-5">
                <EmptyState
                  icon={CircleCheck}
                  title="All caught up"
                  description="No pending assessments or questionnaires right now."
                />
              </div>
            ) : (
              <>
                {derived.pendingAssessments.slice(0, 2).map((assessment) => {
                  const course = findCourse(assessment.courseId)!;
                  const best = bestResult(state.quizResults, assessment.courseId);
                  return (
                    <div key={assessment.id} className="flex items-center gap-3.5 px-5 py-4">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[var(--radius-sm)] bg-warning-soft text-warning">
                        <ClipboardCheck size={18} strokeWidth={1.75} />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-ink">{assessment.title}</p>
                        <p className="truncate text-xs text-ink-muted">
                          {course.code}
                          {best ? ` · last attempt ${best.score}%` : ` · ${assessment.questions.length} questions · pass mark ${assessment.passMark}%`}
                        </p>
                      </div>
                      <Link href={`/trainee/assessments/${assessment.id}`} className={buttonClassName("secondary", "sm")}>
                        {best ? "Retake" : "Take"}
                      </Link>
                    </div>
                  );
                })}
                {derived.upcomingQuestionnaires.slice(0, 1).map((questionnaire) => (
                  <div key={questionnaire.id} className="flex items-center gap-3.5 px-5 py-4">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[var(--radius-sm)] bg-info-soft text-info">
                      <FilePen size={18} strokeWidth={1.75} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-ink">{questionnaire.title}</p>
                      <p className="text-xs text-ink-muted">Due {relativeDays(questionnaire.deadline)} · {questionnaire.trainerName}</p>
                    </div>
                    <QuestionnaireButton questionnaireId={questionnaire.id} />
                  </div>
                ))}
              </>
            )}
          </Card>
        </section>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Recommendations */}
        <section aria-labelledby="recommended">
          <div className="mb-3 flex items-center justify-between">
            <h2 id="recommended" className="text-sm font-semibold text-ink">
              Recommended next
            </h2>
            <Link href="/trainee/explore" className="text-xs font-medium text-primary hover:underline">
              Explore all
            </Link>
          </div>
          <div className="flex flex-col gap-3">
            {recommendations(allCourses, state.enrollments.map((e) => e.courseId)).map((course) => (
              <Card key={course.id} className="flex items-center gap-3.5 p-4">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[var(--radius-sm)] bg-primary-soft text-primary">
                  <Sparkle size={18} strokeWidth={1.75} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-ink">{course.title}</p>
                  <p className="truncate text-xs text-ink-muted">
                    {course.category} · {course.level} · {course.hours} hr
                  </p>
                </div>
                <Link href={`/trainee/explore/${course.id}`} className={buttonClassName("ghost", "sm")}>
                  View
                </Link>
              </Card>
            ))}
          </div>
        </section>

        {/* Achievements + activity */}
        <section aria-labelledby="recent-activity">
          <div className="mb-3 flex items-center justify-between">
            <h2 id="recent-activity" className="text-sm font-semibold text-ink">
              Recent activity
            </h2>
            {state.achievements.length > 0 ? (
              <Link href="/trainee/certificates" className="flex items-center gap-1 text-xs font-medium text-primary hover:underline">
                <Flame size={13} strokeWidth={1.75} />
                {state.achievements.length} achievements
              </Link>
            ) : null}
          </div>
          <Card className="divide-y divide-[var(--color-border)]">
            {state.activity.slice(0, 5).map((entry) => (
              <div key={entry.id} className="flex items-center gap-3 px-5 py-3">
                <CircleCheck size={15} strokeWidth={1.75} className="shrink-0 text-accent" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm text-ink">{entry.label}</p>
                  <p className="text-xs text-ink-muted">{formatDateTime(entry.at)}</p>
                </div>
              </div>
            ))}
          </Card>
        </section>
      </div>

      <div className="flex items-center justify-between border-t border-border pt-4">
        <p className="text-xs text-ink-muted">
          Demo mode: your progress is stored in this browser only.
        </p>
        <ResetDemoButton />
      </div>
    </div>
  );
}

function QuestionnaireButton({ questionnaireId }: { questionnaireId: string }) {
  const [open, setOpen] = useState(false);
  const { submitQuestionnaire } = useDemoStore();
  const questionnaire = QUESTIONNAIRES.find((q) => q.id === questionnaireId);
  if (!questionnaire) return null;

  return (
    <>
      <Button size="sm" variant="secondary" onClick={() => setOpen(true)}>
        Respond
      </Button>
      <QuestionnaireModal
        questionnaire={questionnaire}
        open={open}
        onClose={() => setOpen(false)}
        onSubmit={(answers) => {
          submitQuestionnaire(questionnaire.id, answers);
          setOpen(false);
        }}
      />
    </>
  );
}

function ResetDemoButton() {
  const { resetDemo } = useDemoStore();
  return (
    <Button size="sm" variant="ghost" onClick={resetDemo}>
      Reset demo data
    </Button>
  );
}

/** Deterministic, explainable recommendation: same category as current learning first, then beginner-friendly. */
function recommendations(allCourses: Course[], enrolledCourseIds: string[]) {
  const enrolledCategories = new Set(
    enrolledCourseIds
      .map((id) => allCourses.find((course) => course.id === id)?.category)
      .filter(Boolean) as string[]
  );
  const notEnrolled = allCourses.filter((course) => !enrolledCourseIds.includes(course.id));
  const score = (course: Course) =>
    (enrolledCategories.has(course.category) ? 2 : 0) +
    (course.level === "beginner" ? 1 : 0);
  return notEnrolled.sort((a, b) => score(b) - score(a)).slice(0, 3);
}
