"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  Compass,
  CircleCheck,
  Circle,
  Award,
  ClipboardCheck,
  FileText,
  Presentation,
  MonitorPlay,
  Database,
  BookMarked,
  ArrowRight,
} from "lucide-react";
import type { LearningResource } from "@/lib/types/domain";
import { getAssessmentForCourse } from "@/lib/data/demo/assessments";
import { useDemoStore, isCourseComplete } from "@/lib/store/demo-store";
import { PageHeader } from "@/components/ui/PageHeader";
import { PageSkeleton } from "@/components/ui/Skeleton";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button, buttonClassName } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { Modal } from "@/components/ui/Modal";
import { formatMinutes } from "@/lib/format";

const resourceIcon = {
  "recorded-lecture": MonitorPlay,
  presentation: Presentation,
  "study-material": FileText,
  dataset: Database,
  reference: BookMarked,
} as const;

/**
 * The learning workspace: every enrolled course with module-level progress.
 * Selecting a course opens its modules, materials, and completion controls.
 */
export function MyLearningView() {
  const { state, hydrated, findCourse } = useDemoStore();
  const courses = useMemo(
    () =>
      state.enrollments
        .map((enrollment) => ({ enrollment, course: findCourse(enrollment.courseId)! }))
        .filter((entry) => entry.course),
    [state.enrollments, findCourse]
  );

  // Default to the most recently enrolled in-progress course; completed
  // courses are still selectable from the list below.
  const defaultCourseId = useMemo(() => {
    const active = courses
      .filter((c) => c.enrollment.status === "active")
      .sort((a, b) => (a.enrollment.enrolledAt < b.enrollment.enrolledAt ? 1 : -1));
    return (active[0] ?? courses[0])?.course.id;
  }, [courses]);
  const [selectedId, setSelectedId] = useState<string | undefined>(undefined);
  const selected = courses.find((c) => c.course.id === (selectedId ?? defaultCourseId));

  if (!hydrated) return <PageSkeleton withStats={false} />;

  if (courses.length === 0) {
    return (
      <div className="flex flex-col gap-5">
        <PageHeader title="My Learning" lead="Your active courses, modules, and materials." />
        <EmptyState
          icon={Compass}
          title="No enrollments yet"
          description="You haven't enrolled in any courses. Browse the catalog to start building capability."
          action={
            <Link href="/trainee/explore" className={buttonClassName("primary", "sm")}>
              Explore courses
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      <PageHeader title="My Learning" lead="Your active courses, modules, and materials." />

      {/* Course selector */}
      <div className="flex gap-3 overflow-x-auto pb-1" role="tablist" aria-label="Enrolled courses">
        {courses.map(({ enrollment, course }) => {
          const progress = (enrollment.completedModules.length / course.modules.length) * 100;
          const active = selected?.course.id === course.id;
          return (
            <button
              key={course.id}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setSelectedId(course.id)}
              className={
                "w-56 shrink-0 rounded-[var(--radius-md)] border p-3.5 text-left transition-colors duration-150 " +
                (active
                  ? "border-primary bg-primary-soft/50"
                  : "border-border bg-surface hover:border-border-strong")
              }
            >
              <div className="flex items-center justify-between gap-2">
                <span className="font-mono text-[11px] tabular-nums text-ink-muted">{course.code}</span>
                {enrollment.status === "completed" ? (
                  <Badge tone="success">Done</Badge>
                ) : (
                  <span className="font-mono text-[11px] tabular-nums text-ink-secondary">
                    {Math.round(progress)}%
                  </span>
                )}
              </div>
              <p className="mt-1.5 line-clamp-2 text-sm font-medium leading-snug text-ink">
                {course.title}
              </p>
            </button>
          );
        })}
      </div>

      {selected ? <CourseWorkspace key={selected.course.id} courseId={selected.course.id} /> : null}
    </div>
  );
}

function CourseWorkspace({ courseId }: { courseId: string }) {
  const { state, completeModule, findCourse, resourcesFor } = useDemoStore();
  const course = findCourse(courseId)!;
  const enrollment = state.enrollments.find((e) => e.courseId === courseId)!;
  const [viewing, setViewing] = useState<ViewerResource | null>(null);
  const assessment = getAssessmentForCourse(courseId);
  const passed = state.quizResults.some((r) => r.courseId === courseId && r.passed);
  const bestScore = state.quizResults
    .filter((r) => r.courseId === courseId)
    .sort((a, b) => b.score - a.score)[0]?.score;
  const modulesDone = enrollment.completedModules.length;
  const courseComplete = isCourseComplete(enrollment, course.modules.length);
  const nextModuleId = course.modules.find((m) => !enrollment.completedModules.includes(m.id))?.id;

  return (
    <div className="grid items-start gap-4 lg:grid-cols-[1fr_260px]">
      {/* Modules */}
      <Card className="divide-y divide-[var(--color-border)]">
        <div className="flex items-center justify-between gap-3 px-5 py-4">
          <div className="min-w-0">
            <h2 className="truncate text-sm font-semibold text-ink">{course.title}</h2>
            <p className="mt-0.5 text-xs text-ink-muted">
              {course.trainerName} · {modulesDone} of {course.modules.length} modules complete
            </p>
          </div>
          <Link
            href={`/trainee/explore/${course.id}`}
            className="shrink-0 text-xs font-medium text-primary hover:underline"
          >
            Overview
          </Link>
        </div>

        {course.modules.map((module, index) => {
          const done = enrollment.completedModules.includes(module.id);
          const isNext = module.id === nextModuleId;
          return (
            <div key={module.id} className="flex flex-col gap-3 px-5 py-4">
              <div className="flex items-start gap-3">
                <span
                  className={
                    "mt-0.5 shrink-0 " +
                    (done ? "text-success" : isNext ? "text-primary" : "text-ink-muted")
                  }
                  aria-hidden="true"
                >
                  {done ? <CircleCheck size={18} strokeWidth={1.75} /> : <Circle size={18} strokeWidth={1.75} />}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className={"text-sm font-medium " + (done ? "text-ink-secondary" : "text-ink")}>
                      {index + 1}. {module.title}
                    </p>
                    {isNext ? <Badge tone="accent">Up next</Badge> : null}
                    {done ? <Badge tone="success">Completed</Badge> : null}
                  </div>
                  <p className="mt-0.5 text-xs leading-relaxed text-ink-secondary">{module.summary}</p>
                </div>
                <span className="shrink-0 font-mono text-[11px] tabular-nums text-ink-muted">
                  {formatMinutes(module.minutes)}
                </span>
              </div>

              {module.resources.length > 0 || resourcesFor(course.id, module.id).length > 0 ? (
                <ul className="ml-8 flex flex-col gap-1.5">
                  {module.resources.map((resource) => (
                    <ResourceRow key={resource.id} resource={resource} />
                  ))}
                  {resourcesFor(course.id, module.id).map((resource) => (
                    <ResourceRow
                      key={resource.id}
                      resource={resource}
                      attached
                      onOpen={() => setViewing(resource)}
                    />
                  ))}
                </ul>
              ) : null}

              {!done ? (
                <div className="ml-8">
                  <Button size="sm" variant="secondary" onClick={() => completeModule(course.id, module.id)}>
                    Mark module complete
                  </Button>
                </div>
              ) : null}
            </div>
          );
        })}
      </Card>

      {/* Side rail: certification path */}
      <div className="flex flex-col gap-3">
        <Card className="flex flex-col gap-3 p-5">
          <h2 className="flex items-center gap-2 text-sm font-semibold text-ink">
            <Award size={16} strokeWidth={1.75} className="text-accent" />
            Certification path
          </h2>
          <ul className="flex flex-col gap-2.5 text-xs">
            <PathStep
              done={courseComplete}
              label={`Complete all ${course.modules.length} modules`}
              detail={`${modulesDone} done`}
            />
            <PathStep
              done={passed}
              label={`Pass the assessment${assessment ? ` (≥ ${assessment.passMark}%)` : ""}`}
              detail={bestScore !== undefined ? `Best: ${bestScore}%` : assessment ? "Not attempted" : "No assessment"}
              action={
                assessment && !passed && modulesDone === course.modules.length ? (
                  <Link
                    href={`/trainee/assessments/${assessment.id}`}
                    className="text-xs font-semibold text-primary hover:underline"
                  >
                    Take it now
                  </Link>
                ) : undefined
              }
            />
          </ul>
          {courseComplete && passed ? (
            <p className="rounded-[var(--radius-sm)] bg-success-soft px-3 py-2 text-xs font-medium text-success">
              Certificate earned — see{" "}
              <Link href="/trainee/certificates" className="underline">
                Certificates
              </Link>
              .
            </p>
          ) : null}
        </Card>

        {assessment ? (
          <Card className="flex flex-col gap-2 p-5">
            <h2 className="flex items-center gap-2 text-sm font-semibold text-ink">
              <ClipboardCheck size={16} strokeWidth={1.75} className="text-info" />
              Subject assessment
            </h2>
            <p className="text-xs leading-relaxed text-ink-secondary">
              {assessment.questions.length} MCQs · {assessment.timeLimitMinutes} min limit · pass mark{" "}
              {assessment.passMark}%.
            </p>
            <Link
              href={`/trainee/assessments/${assessment.id}`}
              className={buttonClassName(passed ? "secondary" : "primary", "sm") + " mt-1 gap-1.5"}
            >
              {passed ? "Retake" : bestScore !== undefined ? "Retake" : "Start assessment"}
              <ArrowRight size={14} strokeWidth={2} />
            </Link>
          </Card>
        ) : null}
      </div>

      <ResourceViewer
        resource={viewing}
        course={viewing ? course : undefined}
        onClose={() => setViewing(null)}
      />
    </div>
  );
}

function PathStep({
  done,
  label,
  detail,
  action,
}: {
  done: boolean;
  label: string;
  detail?: string;
  action?: React.ReactNode;
}) {
  return (
    <li className="flex items-start gap-2">
      <CircleCheck
        size={14}
        strokeWidth={1.75}
        className={"mt-0.5 shrink-0 " + (done ? "text-success" : "text-border-strong")}
      />
      <div className="min-w-0 flex-1">
        <p className={"font-medium " + (done ? "text-ink-secondary" : "text-ink")}>{label}</p>
        {detail ? <p className="mt-0.5 text-ink-muted">{detail}</p> : null}
      </div>
      {action}
    </li>
  );
}

export function ResourceRow({
  resource,
  attached,
  onOpen,
}: {
  resource: ViewerResource;
  /** Trainer-attached library items open a detail viewer. */
  attached?: boolean;
  onOpen?: () => void;
}) {
  const Icon = resourceIcon[resource.kind] ?? FileText;
  const content = (
    <>
      <Icon size={13} strokeWidth={1.75} className="shrink-0 text-ink-muted" />
      <span className="truncate">{resource.title}</span>
      {resource.minutes ? (
        <span className="shrink-0 font-mono tabular-nums text-ink-muted">{formatMinutes(resource.minutes)}</span>
      ) : null}
      {attached ? <Badge tone="accent">Added by trainer</Badge> : null}
      <Badge tone="neutral" className="ml-auto shrink-0">
        {resource.format}
      </Badge>
    </>
  );

  if (onOpen) {
    return (
      <li>
        <button
          type="button"
          onClick={onOpen}
          className="flex w-full items-center gap-2 rounded-[var(--radius-sm)] px-1 py-0.5 text-left text-xs text-ink-secondary transition-colors hover:bg-surface-sunken hover:text-ink"
        >
          {content}
        </button>
      </li>
    );
  }

  return (
    <li className="flex items-center gap-2 text-xs text-ink-secondary">{content}</li>
  );
}

/** Anything the viewer can render: curated resources (ref) or trainer-attached items (file/description). */
type ViewerResource = Pick<LearningResource, "title" | "kind" | "format"> & {
  minutes?: number;
  ref?: string;
  description?: string;
  file?: { path: string; name: string; bytes: number; mime: string };
};

/** Honest resource viewer: opens real stored files, labels descriptive records. */
function ResourceViewer({
  resource,
  course,
  onClose,
}: {
  resource: ViewerResource | null;
  course: { title: string; trainerName: string } | undefined;
  onClose: () => void;
}) {
  return (
    <Modal open={Boolean(resource)} onClose={onClose} title={resource?.title ?? "Resource"}>
      {resource ? (
        <div className="flex flex-col gap-4">
          <dl className="grid grid-cols-2 gap-3 text-xs">
            {[
              { label: "Type", value: resource.kind.replace(/-/g, " ") },
              { label: "Format", value: resource.format },
              ...(resource.minutes ? [{ label: "Duration", value: formatMinutes(resource.minutes) }] : []),
              ...(course ? [{ label: "Trainer", value: course.trainerName }] : []),
              ...(resource.file
                ? [{ label: "Size", value: `${Math.max(1, Math.round(resource.file.bytes / 1024))} KB` }]
                : []),
            ].map((item) => (
              <div key={item.label} className="rounded-[var(--radius-sm)] bg-surface-sunken px-3 py-2">
                <dt className="text-ink-muted">{item.label}</dt>
                <dd className="mt-0.5 font-medium capitalize text-ink">{item.value}</dd>
              </div>
            ))}
          </dl>
          <p className="text-sm leading-relaxed text-ink-secondary">
            {resource.description ?? resource.ref ?? "No further details recorded."}
          </p>
          {resource.file ? (
            <a
              href={`/api/resources/file?path=${encodeURIComponent(resource.file.path)}`}
              target="_blank"
              rel="noreferrer"
              className={buttonClassName("primary", "md") + " w-fit gap-1.5"}
            >
              <MonitorPlay size={15} strokeWidth={1.75} />
              Open / download file
            </a>
          ) : (
            <p className="rounded-[var(--radius-sm)] bg-info-soft px-3 py-2 text-xs leading-relaxed text-info">
              Demo record: this curated catalog item has no stored media. Resources uploaded by
              trainers include a real, downloadable file.
            </p>
          )}
        </div>
      ) : null}
    </Modal>
  );
}
