"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  ArrowLeft,
  Users,
  ClipboardList,
  Clock,
  TriangleAlert,
  Globe,
  EyeOff,
  Pencil,
} from "lucide-react";
import type { Course } from "@/lib/types/domain";
import { participationFor, rosterForCourse, isInactive } from "@/lib/data/demo/cohort";
import { getAssessmentForCourse } from "@/lib/data/demo/assessments";
import { useTrainerStore } from "@/lib/store/trainer-store";
import { PageHeader } from "@/components/ui/PageHeader";
import { PageSkeleton } from "@/components/ui/Skeleton";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { StatCard } from "@/components/ui/StatCard";
import { Button, buttonClassName } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { Modal } from "@/components/ui/Modal";
import { EmptyState } from "@/components/ui/EmptyState";
import { relativeDays } from "@/lib/format";

/** Manage a single course: lifecycle, curriculum, roster monitoring. */
export function CourseManageView({ courseId }: { courseId: string }) {
  const { state, hydrated, publishCourse, unpublishCourse } = useTrainerStore();
  const course = useMemo(
    () => state.courses.find((c) => c.id === courseId),
    [state.courses, courseId]
  );
  const [editOpen, setEditOpen] = useState(false);

  if (!hydrated) return <PageSkeleton withStats={false} />;

  if (!course) {
    return (
      <div className="flex flex-col items-center gap-4 py-16 text-center">
        <p className="text-sm font-semibold text-ink">Course not found</p>
        <Link href="/trainer/courses" className={buttonClassName("secondary", "sm")}>
          Back to My Courses
        </Link>
      </div>
    );
  }

  const stats = participationFor(course);
  const roster = rosterForCourse(course.id);
  const assessment = getAssessmentForCourse(course.id);
  // Curated catalog courses carry no status and are not editable here;
  // trainer-authored ones always have a lifecycle (legacy local drafts default to draft).
  const authored = course.status !== undefined || course.trainerId === "self";
  const lifecycle = course.status ?? "draft";

  return (
    <div className="flex flex-col gap-5">
      <Link
        href="/trainer/courses"
        className="flex w-fit items-center gap-1.5 text-sm text-ink-secondary transition-colors hover:text-ink"
      >
        <ArrowLeft size={15} strokeWidth={1.75} />
        My Courses
      </Link>

      <PageHeader
        title={course.title}
        lead={course.description}
        actions={
          <div className="flex items-center gap-2">
            <Badge tone="neutral">{course.code}</Badge>
            {course.status === "draft" ? <Badge tone="warning">Draft</Badge> : null}
            {course.status === "published" ? <Badge tone="success">Published</Badge> : null}
          </div>
        }
      />

      {authored ? (
        <Card className="flex flex-wrap items-center gap-3 p-4">
          <p className="min-w-0 flex-1 text-xs text-ink-secondary">
            {lifecycle === "draft"
              ? "This course is a draft — trainees cannot see it yet. Publish it to make it discoverable and enrollable."
              : "Published — trainees can discover this course in Explore and enroll."}
          </p>
          <Button size="sm" variant="ghost" onClick={() => setEditOpen(true)}>
            <Pencil size={14} strokeWidth={1.75} />
            Edit details
          </Button>
          {lifecycle === "draft" ? (
            <Button size="sm" onClick={() => publishCourse(course.id)}>
              <Globe size={14} strokeWidth={1.75} />
              Publish
            </Button>
          ) : (
            <Button size="sm" variant="secondary" onClick={() => unpublishCourse(course.id)}>
              <EyeOff size={14} strokeWidth={1.75} />
              Unpublish
            </Button>
          )}
        </Card>
      ) : null}

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard icon={Users} tone="primary" value={stats.traineeCount} label="Enrolled" />
        <StatCard icon={ClipboardList} tone="accent" value={course.modules.length} label="Modules" />
        <StatCard icon={Clock} value={`${course.hours} hr`} label="Contact time" />
        <StatCard
          icon={TriangleAlert}
          tone={stats.atRiskCount > 0 ? "warning" : "neutral"}
          value={stats.atRiskCount}
          label="Inactive 5+ days"
        />
      </div>

      <div className="grid items-start gap-4 lg:grid-cols-[1fr_260px]">
        {/* Roster */}
        <Card className="overflow-x-auto">
          <div className="flex items-center justify-between border-b border-border px-5 py-4">
            <h2 className="text-sm font-semibold text-ink">Cohort roster</h2>
            <p className="text-xs text-ink-muted">Module progress and assessment scores</p>
          </div>
          {roster.length === 0 ? (
            <div className="p-5">
              <EmptyState
                icon={Users}
                title="No enrollments yet"
                description="Trainees will appear here as soon as the cohort enrolls."
              />
            </div>
          ) : (
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-border text-xs text-ink-muted">
                  <th scope="col" className="px-5 py-3 font-medium">Trainee</th>
                  <th scope="col" className="px-5 py-3 font-medium">Station</th>
                  <th scope="col" className="px-5 py-3 font-medium">Progress</th>
                  <th scope="col" className="px-5 py-3 font-medium">Score</th>
                  <th scope="col" className="px-5 py-3 font-medium">Last active</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-border)]">
                {roster.map((trainee) => {
                  const progress = trainee.progress[course.id] ?? 0;
                  const score = trainee.scores[course.id];
                  const inactive = isInactive(trainee.lastActiveAt);
                  return (
                    <tr key={trainee.id} className="text-ink-secondary">
                      <td className="px-5 py-3">
                        <p className="font-medium text-ink">{trainee.name}</p>
                        <p className="text-xs text-ink-muted">{trainee.designation}</p>
                      </td>
                      <td className="px-5 py-3 text-xs">{trainee.region}</td>
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2.5">
                          <ProgressBar value={progress} size="sm" className="w-24" />
                          <span className="font-mono text-xs tabular-nums text-ink">{progress}%</span>
                        </div>
                      </td>
                      <td className="px-5 py-3 font-mono text-xs tabular-nums">
                        {score !== undefined ? (
                          <span className={score >= (assessment?.passMark ?? 60) ? "text-success" : "text-warning"}>
                            {score}%
                          </span>
                        ) : (
                          <span className="text-ink-muted">—</span>
                        )}
                      </td>
                      <td className="whitespace-nowrap px-5 py-3 text-xs">
                        {relativeDays(trainee.lastActiveAt)}
                        {inactive ? <span className="ml-1.5 text-warning">· at risk</span> : null}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </Card>

        {/* Side rail */}
        <div className="flex flex-col gap-3">
          <Card className="flex flex-col gap-3 p-5">
            <h2 className="text-sm font-semibold text-ink">Cohort summary</h2>
            <ul className="flex flex-col gap-2.5 text-xs">
              <SummaryRow label="Mean progress" value={`${stats.meanProgress}%`} />
              <SummaryRow label="Completion rate" value={`${stats.completionRate}%`} />
              <SummaryRow label="Attempt rate" value={`${stats.attemptRate}%`} />
              <SummaryRow label="Mean score" value={stats.meanScore ? `${stats.meanScore}%` : "—"} />
            </ul>
            {assessment ? (
              <Link href="/trainer/performance" className={buttonClassName("secondary", "sm") + " mt-1"}>
                View performance detail
              </Link>
            ) : null}
          </Card>

          <Card className="flex flex-col gap-2.5 p-5">
            <h2 className="text-sm font-semibold text-ink">Curriculum</h2>
            <ol className="flex flex-col gap-2 text-xs">
              {course.modules.map((module, index) => (
                <li key={module.id} className="flex items-start gap-2">
                  <span className="mt-0.5 font-mono tabular-nums text-ink-muted">{index + 1}.</span>
                  <div>
                    <p className="font-medium text-ink">{module.title}</p>
                    <p className="text-ink-muted">{module.minutes} min · {module.resources.length} resources</p>
                  </div>
                </li>
              ))}
            </ol>
          </Card>
        </div>
      </div>

      <EditCourseModal course={course} open={editOpen} onClose={() => setEditOpen(false)} />
    </div>
  );
}

/** Metadata editor for trainer-authored courses. Modules are fixed after publish. */
function EditCourseModal({
  course,
  open,
  onClose,
}: {
  course: Course;
  open: boolean;
  onClose: () => void;
}) {
  const { updateCourse } = useTrainerStore();
  const [draft, setDraft] = useState({
    title: course.title,
    description: course.description,
    subject: course.subject ?? "",
    level: course.level,
  });
  const [error, setError] = useState<string | undefined>();

  const save = () => {
    if (draft.title.trim().length < 5) {
      setError("Title needs at least 5 characters.");
      return;
    }
    if (draft.description.trim().length < 20) {
      setError("Description needs at least 20 characters.");
      return;
    }
    setError(undefined);
    updateCourse(course.id, {
      title: draft.title.trim(),
      description: draft.description.trim(),
      subject: draft.subject.trim() || undefined,
      level: draft.level,
    });
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={`Edit ${course.code}`}
      footer={
        <>
          <Button variant="ghost" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button size="sm" onClick={save}>
            Save changes
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <Input
          label="Title"
          value={draft.title}
          onChange={(event) => setDraft((d) => ({ ...d, title: event.target.value }))}
          required
        />
        <Textarea
          label="Description"
          rows={3}
          value={draft.description}
          onChange={(event) => setDraft((d) => ({ ...d, description: event.target.value }))}
          required
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Subject"
            value={draft.subject}
            placeholder="Fine-grained subject line"
            onChange={(event) => setDraft((d) => ({ ...d, subject: event.target.value }))}
          />
          <Select
            label="Level"
            value={draft.level}
            options={[
              { value: "beginner", label: "Beginner" },
              { value: "intermediate", label: "Intermediate" },
              { value: "advanced", label: "Advanced" },
            ]}
            onChange={(event) => setDraft((d) => ({ ...d, level: event.target.value as Course["level"] }))}
          />
        </div>
        {error ? (
          <p role="alert" className="rounded-[var(--radius-sm)] bg-error-soft px-3 py-2 text-sm font-medium text-error">
            {error}
          </p>
        ) : null}
        <p className="text-xs text-ink-muted">
          Category: {course.category} (fixed) · {course.modules.length} modules (curriculum is fixed after
          creation in demo mode).
        </p>
      </div>
    </Modal>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <li className="flex items-center justify-between">
      <span className="text-ink-muted">{label}</span>
      <span className="font-mono tabular-nums font-medium text-ink">{value}</span>
    </li>
  );
}
