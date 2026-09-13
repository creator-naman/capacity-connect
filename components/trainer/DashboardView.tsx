"use client";

import Link from "next/link";
import { useMemo } from "react";
import {
  BookOpen,
  Users,
  ClipboardCheck,
  ChartLine,
  Hourglass,
  FilePen,
  Bell,
  Plus,
} from "lucide-react";
import { useTrainerStore } from "@/lib/store/trainer-store";
import { participationFor, rosterForCourse, responsesForQuestionnaire } from "@/lib/data/demo/cohort";
import { PageHeader } from "@/components/ui/PageHeader";
import { PageSkeleton } from "@/components/ui/Skeleton";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { StatCard } from "@/components/ui/StatCard";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { buttonClassName } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatDate, relativeDays } from "@/lib/format";

/** Trainer home: teaching portfolio snapshot, deadlines, and cohort pulse. */
export function TrainerDashboardView({ firstName }: { firstName: string }) {
  const { state, hydrated } = useTrainerStore();

  const derived = useMemo(() => {
    const participation = state.courses.map((course) => participationFor(course));
    const traineeIds = new Set(state.courses.flatMap((course) => rosterForCourse(course.id).map((t) => t.id)));
    const meanProgress = participation.length
      ? Math.round(participation.reduce((sum, p) => sum + p.meanProgress, 0) / participation.length)
      : 0;
    const responses = state.questionnaires.flatMap((q) =>
      responsesForQuestionnaire(q.id).map((response) => ({ questionnaire: q, response }))
    );
    const pendingQuestionnaires = state.questionnaires.filter((q) => new Date(q.deadline) >= new Date());
    const unreadCount = state.notifications.filter((n) => !n.read).length;
    return { participation, traineeCount: traineeIds.size, meanProgress, responses, pendingQuestionnaires, unreadCount };
  }, [state]);

  if (!hydrated) return <PageSkeleton />;

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={`${greeting}, ${firstName}`}
        lead="Your teaching portfolio and cohort at a glance."
        actions={
          <div className="flex items-center gap-2">
            {derived.unreadCount > 0 ? (
              <Link href="/trainer/notifications" className={buttonClassName("secondary", "sm") + " gap-1.5"}>
                <Bell size={14} strokeWidth={1.75} />
                {derived.unreadCount} new
              </Link>
            ) : null}
            <Link href="/trainer/courses/create" className={buttonClassName("primary", "sm") + " gap-1.5"}>
              <Plus size={14} strokeWidth={2} />
              New course
            </Link>
          </div>
        }
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard icon={BookOpen} tone="primary" value={state.courses.length} label="Active courses" href="/trainer/courses" />
        <StatCard icon={Users} tone="accent" value={derived.traineeCount} label="Cohort trainees" href="/trainer/trainees" />
        <StatCard icon={ChartLine} tone="warning" value={`${derived.meanProgress}%`} label="Mean progress" href="/trainer/performance" />
        <StatCard icon={ClipboardCheck} value={derived.pendingQuestionnaires.length} label="Open questionnaires" href="/trainer/questionnaires" />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Courses snapshot */}
        <section aria-labelledby="my-courses-snapshot">
          <div className="mb-3 flex items-center justify-between">
            <h2 id="my-courses-snapshot" className="text-sm font-semibold text-ink">
              Course participation
            </h2>
            <Link href="/trainer/courses" className="text-xs font-medium text-primary hover:underline">
              All courses
            </Link>
          </div>
          {state.courses.length === 0 ? (
            <EmptyState
              icon={BookOpen}
              title="No courses yet"
              description="Create your first course to start building the training catalog."
              action={
                <Link href="/trainer/courses/create" className={buttonClassName("primary", "sm")}>
                  Create a course
                </Link>
              }
            />
          ) : (
            <Card className="divide-y divide-[var(--color-border)]">
              {state.courses.slice(0, 4).map((course) => {
                const stats = derived.participation.find((p) => p.courseId === course.id)!;
                return (
                  <div key={course.id} className="px-5 py-4">
                    <div className="flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-ink">{course.title}</p>
                        <p className="text-xs text-ink-muted">
                          <span className="font-mono tabular-nums">{course.code}</span> · {stats.traineeCount} trainees
                          {stats.atRiskCount > 0 ? ` · ${stats.atRiskCount} inactive` : ""}
                        </p>
                      </div>
                      <Link
                        href={`/trainer/courses/${course.id}`}
                        className={buttonClassName("secondary", "sm")}
                      >
                        Manage
                      </Link>
                    </div>
                    <ProgressBar value={stats.meanProgress} size="sm" className="mt-3" label="Mean progress" />
                  </div>
                );
              })}
            </Card>
          )}
        </section>

        {/* Deadlines + questionnaire responses */}
        <section aria-labelledby="deadlines">
          <div className="mb-3 flex items-center justify-between">
            <h2 id="deadlines" className="text-sm font-semibold text-ink">
              Questionnaires &amp; deadlines
            </h2>
            <Link href="/trainer/questionnaires" className="text-xs font-medium text-primary hover:underline">
              All questionnaires
            </Link>
          </div>
          <Card className="divide-y divide-[var(--color-border)]">
            {derived.pendingQuestionnaires.length === 0 ? (
              <div className="p-5">
                <EmptyState
                  icon={FilePen}
                  title="No open questionnaires"
                  description="Publish a questionnaire to gather structured feedback from your cohort."
                  action={
                    <Link href="/trainer/questionnaires/create" className={buttonClassName("primary", "sm")}>
                      Create questionnaire
                    </Link>
                  }
                />
              </div>
            ) : (
              derived.pendingQuestionnaires.slice(0, 3).map((questionnaire) => {
                const responses = responsesForQuestionnaire(questionnaire.id);
                return (
                  <div key={questionnaire.id} className="flex items-center gap-3.5 px-5 py-4">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[var(--radius-sm)] bg-info-soft text-info">
                      <FilePen size={18} strokeWidth={1.75} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-ink">{questionnaire.title}</p>
                      <p className="flex items-center gap-1 text-xs text-ink-muted">
                        <Hourglass size={12} strokeWidth={1.75} />
                        Due {relativeDays(questionnaire.deadline)} · {responses.length} responses
                      </p>
                    </div>
                    <Badge tone={responses.length > 0 ? "success" : "warning"}>
                      {responses.length > 0 ? "Responses in" : "Awaiting"}
                    </Badge>
                  </div>
                );
              })
            )}
            {derived.responses.length > 0 ? (
              <div className="px-5 py-4">
                <p className="text-xs text-ink-muted">
                  Latest response: {derived.responses[0].response.traineeName} on{" "}
                  {formatDate(derived.responses[0].response.submittedAt)} — {derived.responses[0].questionnaire.title}
                </p>
              </div>
            ) : null}
          </Card>
        </section>
      </div>

      <div className="flex items-center justify-between border-t border-border pt-4">
        <p className="text-xs text-ink-muted">
          Demo mode: trainer data is stored in this browser only.
        </p>
        <ResetDemoButton />
      </div>
    </div>
  );
}

function ResetDemoButton() {
  const { resetDemo } = useTrainerStore();
  return (
    <button
      type="button"
      onClick={resetDemo}
      className="text-xs text-ink-muted underline-offset-2 hover:text-ink hover:underline"
    >
      Reset demo data
    </button>
  );
}
