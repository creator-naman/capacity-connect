"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { BookOpen, Plus, Search, Users } from "lucide-react";
import { useTrainerStore } from "@/lib/store/trainer-store";
import { participationFor } from "@/lib/data/demo/cohort";
import { COURSE_CATEGORIES } from "@/lib/data/demo/courses";
import { PageHeader } from "@/components/ui/PageHeader";
import { PageSkeleton } from "@/components/ui/Skeleton";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { buttonClassName } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";

/** The trainer's course portfolio with live participation numbers. */
export function CoursesView({ initialQuery }: { initialQuery?: string }) {
  const { state, hydrated } = useTrainerStore();
  const [query, setQuery] = useState(initialQuery ?? "");
  const [category, setCategory] = useState<string>("all");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return state.courses.filter((course) => {
      if (category !== "all" && course.category !== category) return false;
      if (!q) return true;
      return (
        course.title.toLowerCase().includes(q) ||
        course.code.toLowerCase().includes(q) ||
        course.tags.some((tag) => tag.toLowerCase().includes(q))
      );
    });
  }, [state.courses, query, category]);

  if (!hydrated) return <PageSkeleton withStats={false} />;

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title="My Courses"
        lead="Courses you author and deliver, with cohort participation."
        actions={
          <Link href="/trainer/courses/create" className={buttonClassName("primary", "sm") + " gap-1.5"}>
            <Plus size={14} strokeWidth={2} />
            Create course
          </Link>
        }
      />

      <div className="flex flex-col gap-3">
        <label className="relative flex items-center">
          <Search size={16} strokeWidth={1.75} className="pointer-events-none absolute left-3 text-ink-muted" />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search your courses by title, code, or tag…"
            aria-label="Search my courses"
            className="h-10 w-full rounded-[var(--radius-sm)] border border-border-strong bg-surface pl-9 pr-3 text-sm text-ink placeholder:text-ink-muted focus:border-primary focus:outline-none"
          />
        </label>
        <div className="flex flex-wrap items-center gap-1.5">
          <Chip label="All categories" active={category === "all"} onClick={() => setCategory("all")} />
          {COURSE_CATEGORIES.map((c) => (
            <Chip key={c} label={c} active={category === c} onClick={() => setCategory(c)} />
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title={state.courses.length === 0 ? "No courses yet" : "No courses match"}
          description={
            state.courses.length === 0
              ? "Create your first course to start building the training catalog."
              : "Try a different search term or clear the category filter."
          }
          action={
            state.courses.length === 0 ? (
              <Link href="/trainer/courses/create" className={buttonClassName("primary", "sm")}>
                Create a course
              </Link>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setQuery("");
                  setCategory("all");
                }}
                className="text-sm font-medium text-primary hover:underline"
              >
                Clear filters
              </button>
            )
          }
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {filtered.map((course) => {
            const stats = participationFor(course);
            return (
              <Card key={course.id} className="flex h-full flex-col p-5 transition-colors hover:border-border-strong">
                <div className="flex items-start justify-between gap-3">
                  <Badge tone="neutral">{course.code}</Badge>
                  <div className="flex items-center gap-1.5">
                    {course.status === "draft" ? <Badge tone="warning">Draft</Badge> : null}
                    {course.status === "published" ? <Badge tone="success">Published</Badge> : null}
                    <Badge tone="info">{course.category}</Badge>
                  </div>
                </div>
                <Link href={`/trainer/courses/${course.id}`} className="mt-3 block">
                  <h3 className="text-base font-semibold leading-snug text-ink hover:text-primary">
                    {course.title}
                  </h3>
                </Link>
                <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-ink-secondary">
                  {course.description}
                </p>
                <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-ink-muted">
                  <span className="flex items-center gap-1">
                    <Users size={13} strokeWidth={1.75} />
                    {stats.traineeCount} trainees
                  </span>
                  <span>{course.modules.length} modules</span>
                  <span>{course.level}</span>
                </div>
                <div className="mt-4 border-t border-border pt-4">
                  <ProgressBar value={stats.meanProgress} label="Mean cohort progress" size="sm" />
                </div>
                <div className="mt-4 flex items-center gap-2">
                  <Link href={`/trainer/courses/${course.id}`} className={buttonClassName("secondary", "sm")}>
                    Manage
                  </Link>
                  {stats.atRiskCount > 0 ? (
                    <span className="text-xs text-warning">{stats.atRiskCount} inactive 5+ days</span>
                  ) : null}
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

function Chip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={
        "h-8 rounded-full border px-3.5 text-xs font-medium transition-colors duration-150 " +
        (active
          ? "border-primary bg-primary-soft text-primary"
          : "border-border-strong text-ink-secondary hover:border-ink-muted hover:text-ink")
      }
    >
      {label}
    </button>
  );
}
