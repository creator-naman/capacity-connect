import Link from "next/link";
import { BookOpen, Clock } from "lucide-react";
import type { Course } from "@/lib/types/domain";
import { Badge } from "@/components/ui/Badge";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Card } from "@/components/ui/Card";

const levelTone = {
  beginner: "success",
  intermediate: "info",
  advanced: "warning",
} as const;

/**
 * Catalog card for a course. `progress` (0-100) renders the continue
 * variant used on the dashboard and My Learning.
 */
export function CourseCard({
  course,
  progress,
  isEnrolled,
  isCompleted,
}: {
  course: Course;
  progress?: number;
  isEnrolled?: boolean;
  isCompleted?: boolean;
}) {
  const href = `/trainee/explore/${course.id}`;

  return (
    <Card className="flex h-full flex-col p-5 transition-colors hover:border-border-strong">
      <div className="flex items-start justify-between gap-3">
        <Badge tone="neutral">{course.category}</Badge>
        {isCompleted ? (
          <Badge tone="success">Completed</Badge>
        ) : isEnrolled ? (
          <Badge tone="accent">Enrolled</Badge>
        ) : (
          <Badge tone={levelTone[course.level]}>{course.level}</Badge>
        )}
      </div>

      <Link href={href} className="mt-3 block">
        <h3 className="text-base font-semibold leading-snug text-ink hover:text-primary">
          {course.title}
        </h3>
      </Link>
      <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-ink-secondary">
        {course.description}
      </p>

      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-ink-muted">
        <span>{course.trainerName}</span>
        <span className="flex items-center gap-1">
          <BookOpen size={13} strokeWidth={1.75} />
          {course.modules.length} modules
        </span>
        <span className="flex items-center gap-1">
          <Clock size={13} strokeWidth={1.75} />
          {course.hours} hr
        </span>
      </div>

      {typeof progress === "number" ? (
        <div className="mt-4 border-t border-border pt-4">
          <ProgressBar value={progress} label="Progress" size="sm" />
        </div>
      ) : null}
    </Card>
  );
}
