"use client";

import { useMemo, useState } from "react";
import { Search, Compass, Sparkle } from "lucide-react";
import { COURSE_CATEGORIES } from "@/lib/data/demo/courses";
import { useDemoStore } from "@/lib/store/demo-store";
import { PageHeader } from "@/components/ui/PageHeader";
import { PageSkeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { CourseCard } from "./CourseCard";

type LevelFilter = "all" | "beginner" | "intermediate" | "advanced";

/**
 * Course catalog: the curated demo catalog plus courses trainers have
 * published through the portal (marked "New"). The topbar search lands
 * here with `?q=`, which seeds the query; category and level filters
 * narrow the grid client-side.
 */
export function ExploreView({ initialQuery }: { initialQuery?: string }) {
  const { state, hydrated, allCourses } = useDemoStore();
  const [query, setQuery] = useState(initialQuery ?? "");
  const [category, setCategory] = useState<string>("all");
  const [level, setLevel] = useState<LevelFilter>("all");

  const enrolledIds = useMemo(
    () => new Set(state.enrollments.map((e) => e.courseId)),
    [state.enrollments]
  );
  const completedIds = useMemo(
    () => new Set(state.enrollments.filter((e) => e.status === "completed").map((e) => e.courseId)),
    [state.enrollments]
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return allCourses.filter((course) => {
      if (category !== "all" && course.category !== category) return false;
      if (level !== "all" && course.level !== level) return false;
      if (!q) return true;
      return (
        course.title.toLowerCase().includes(q) ||
        course.code.toLowerCase().includes(q) ||
        course.description.toLowerCase().includes(q) ||
        course.category.toLowerCase().includes(q) ||
        course.trainerName.toLowerCase().includes(q) ||
        (course.subject?.toLowerCase().includes(q) ?? false) ||
        course.tags.some((tag) => tag.toLowerCase().includes(q))
      );
    });
  }, [allCourses, query, category, level]);

  if (!hydrated) return <PageSkeleton withStats={false} />;

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title="Explore Courses"
        lead="Browse the training catalog and enroll in what fits your development plan."
      />

      {/* Search + filters */}
      <div className="flex flex-col gap-3">
        <label className="relative flex items-center">
          <Search
            size={16}
            strokeWidth={1.75}
            className="pointer-events-none absolute left-3 text-ink-muted"
          />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search by title, code, trainer, or topic…"
            aria-label="Search courses"
            className="h-10 w-full rounded-[var(--radius-sm)] border border-border-strong bg-surface pl-9 pr-3 text-sm text-ink placeholder:text-ink-muted focus:border-primary focus:outline-none"
          />
        </label>

        <div className="flex flex-wrap items-center gap-1.5">
          <FilterChip
            label="All categories"
            active={category === "all"}
            onClick={() => setCategory("all")}
          />
          {COURSE_CATEGORIES.map((c) => (
            <FilterChip
              key={c}
              label={c}
              active={category === c}
              onClick={() => setCategory(c)}
            />
          ))}
          <span className="mx-1 hidden h-5 w-px bg-border sm:block" aria-hidden="true" />
          <FilterChip label="Any level" active={level === "all"} onClick={() => setLevel("all")} />
          <FilterChip label="Beginner" active={level === "beginner"} onClick={() => setLevel("beginner")} />
          <FilterChip label="Intermediate" active={level === "intermediate"} onClick={() => setLevel("intermediate")} />
          <FilterChip label="Advanced" active={level === "advanced"} onClick={() => setLevel("advanced")} />
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={Compass}
          title="No courses match"
          description="Try a different search term or clear the category and level filters."
          action={
            <button
              type="button"
              onClick={() => {
                setQuery("");
                setCategory("all");
                setLevel("all");
              }}
              className="text-sm font-medium text-primary hover:underline"
            >
              Clear all filters
            </button>
          }
        />
      ) : (
        <>
          <p className="text-xs text-ink-muted" aria-live="polite">
            Showing {filtered.length} of {allCourses.length} courses
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            {filtered.map((course) => (
              <div key={course.id} className="relative">
                {course.status === "published" ? (
                  <span className="absolute -top-1.5 right-3 z-10 flex items-center gap-1 rounded-full bg-accent px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white">
                    <Sparkle size={10} strokeWidth={2} />
                    New
                  </span>
                ) : null}
                <CourseCard
                  course={course}
                  isEnrolled={enrolledIds.has(course.id)}
                  isCompleted={completedIds.has(course.id)}
                />
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function FilterChip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
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
