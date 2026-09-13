"use client";

import { useEffect, useMemo, useState } from "react";
import { BookOpen, Search, Users } from "lucide-react";
import { useAdminStore } from "@/lib/store/admin-store";
import { readSharedCatalog } from "@/lib/store/shared-catalog";
import { COURSES, COURSE_CATEGORIES } from "@/lib/data/demo/courses";
import { participationFor } from "@/lib/data/demo/cohort";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";

/** Course monitoring: curated catalog + trainer-published courses. */
export function AdminCoursesView() {
  const { hydrated } = useAdminStore();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string>("all");
  const [trainerPublished, setTrainerPublished] = useState<{ id: string; code: string; title: string; trainerName: string; modules: number }[]>([]);

  useEffect(() => {
    const refresh = () =>
      setTrainerPublished(
        readSharedCatalog().courses.map((course) => ({
          id: course.id,
          code: course.code,
          title: course.title,
          trainerName: course.trainerName,
          modules: course.modules.length,
        }))
      );
    refresh();
    window.addEventListener("cc-catalog-changed", refresh);
    return () => window.removeEventListener("cc-catalog-changed", refresh);
  }, []);

  const q = query.trim().toLowerCase();
  const curated = useMemo(
    () =>
      COURSES.filter((course) => {
        if (category !== "all" && course.category !== category) return false;
        if (!q) return true;
        return (
          course.title.toLowerCase().includes(q) ||
          course.code.toLowerCase().includes(q) ||
          course.trainerName.toLowerCase().includes(q)
        );
      }),
    [q, category]
  );
  const published = trainerPublished.filter((course) => {
    if (category !== "all") return false;
    if (!q) return true;
    return course.title.toLowerCase().includes(q) || course.code.toLowerCase().includes(q);
  });

  if (!hydrated) {
    return (
      <div className="flex flex-col gap-4" role="status" aria-label="Loading">
        <span className="sr-only">Loading…</span>
        <div className="h-7 w-48 animate-pulse rounded-[var(--radius-sm)] bg-surface-sunken" />
        <div className="h-64 animate-pulse rounded-[var(--radius-md)] bg-surface-sunken" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title="Courses"
        lead="Every published course with its trainer and cohort health."
      />

      <div className="flex flex-col gap-3">
        <label className="relative flex items-center">
          <Search size={16} strokeWidth={1.75} className="pointer-events-none absolute left-3 text-ink-muted" />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search by title, code, or trainer…"
            aria-label="Search courses"
            className="h-10 w-full rounded-[var(--radius-sm)] border border-border-strong bg-surface pl-9 pr-3 text-sm text-ink placeholder:text-ink-muted focus:border-primary focus:outline-none"
          />
        </label>
        <div className="flex flex-wrap gap-1.5">
          <Chip label="All categories" active={category === "all"} onClick={() => setCategory("all")} />
          {COURSE_CATEGORIES.map((c) => (
            <Chip key={c} label={c} active={category === c} onClick={() => setCategory(c)} />
          ))}
        </div>
      </div>

      {curated.length === 0 && published.length === 0 ? (
        <EmptyState icon={BookOpen} title="No courses match" description="Adjust the search or category filter." />
      ) : (
        <Card className="overflow-x-auto">
          <table className="w-full min-w-[680px] text-left text-sm">
            <thead>
              <tr className="border-b border-border text-xs text-ink-muted">
                <th scope="col" className="px-5 py-3 font-medium">Course</th>
                <th scope="col" className="px-5 py-3 font-medium">Trainer</th>
                <th scope="col" className="px-5 py-3 font-medium">Trainees</th>
                <th scope="col" className="px-5 py-3 font-medium">Mean progress</th>
                <th scope="col" className="px-5 py-3 font-medium">Source</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-border)] text-ink-secondary">
              {curated.map((course) => {
                const stats = participationFor(course);
                return (
                  <tr key={course.id}>
                    <td className="px-5 py-3.5">
                      <p className="font-medium text-ink">{course.title}</p>
                      <p className="font-mono text-[11px] tabular-nums text-ink-muted">{course.code}</p>
                    </td>
                    <td className="px-5 py-3.5 text-xs">{course.trainerName}</td>
                    <td className="px-5 py-3.5 font-mono tabular-nums text-xs">{stats.traineeCount}</td>
                    <td className="px-5 py-3.5 font-mono tabular-nums text-xs">{stats.meanProgress}%</td>
                    <td className="px-5 py-3.5">
                      <Badge tone="neutral">Curated</Badge>
                    </td>
                  </tr>
                );
              })}
              {published.map((course) => (
                <tr key={course.id}>
                  <td className="px-5 py-3.5">
                    <p className="font-medium text-ink">{course.title}</p>
                    <p className="font-mono text-[11px] tabular-nums text-ink-muted">{course.code}</p>
                  </td>
                  <td className="px-5 py-3.5 text-xs">{course.trainerName}</td>
                  <td className="px-5 py-3.5">
                    <span className="flex items-center gap-1 text-xs text-ink-muted">
                      <Users size={12} strokeWidth={1.75} />0
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-xs text-ink-muted">—</td>
                  <td className="px-5 py-3.5">
                    <Badge tone="accent">Trainer-published</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
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
