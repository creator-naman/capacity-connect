"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  Users,
  BookOpen,
  ClipboardList,
  Award,
  Megaphone,
  Hourglass,
  ArrowRight,
} from "lucide-react";
import type { SessionUser } from "@/lib/auth/types";
import { useAdminStore } from "@/lib/store/admin-store";
import { readSharedCatalog } from "@/lib/store/shared-catalog";
import { COURSES } from "@/lib/data/demo/courses";
import { COHORT, participationFor } from "@/lib/data/demo/cohort";
import { PageHeader } from "@/components/ui/PageHeader";
import { PageSkeleton } from "@/components/ui/Skeleton";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { StatCard } from "@/components/ui/StatCard";
import { buttonClassName } from "@/components/ui/Button";
import { formatDate } from "@/lib/format";

/** Admin home: platform pulse, pending approvals, and publishing shortcuts. */
export function AdminDashboardView({ firstName, accounts }: { firstName: string; accounts: SessionUser[] }) {
  const { hydrated, announcements, contentPosts } = useAdminStore();
  const [publishedCourseCount, setPublishedCourseCount] = useState(COURSES.length);

  useEffect(() => {
    const refresh = () => setPublishedCourseCount(COURSES.length + readSharedCatalog().courses.length);
    refresh();
    window.addEventListener("cc-catalog-changed", refresh);
    return () => window.removeEventListener("cc-catalog-changed", refresh);
  }, []);

  const derived = useMemo(() => {
    const pending = accounts.filter((a) => a.status === "pending");
    const trainees = accounts.filter((a) => a.role === "trainee" && a.status === "active").length;
    const meanProgress = COURSES.length
      ? Math.round(COURSES.reduce((sum, c) => sum + participationFor(c).meanProgress, 0) / COURSES.length)
      : 0;
    return { pending, trainees, meanProgress, cohort: COHORT.length };
  }, [accounts]);

  if (!hydrated) return <PageSkeleton />;

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={`${greeting}, ${firstName}`}
        lead="Platform oversight — accounts, catalog health, and communication."
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard icon={BookOpen} tone="primary" value={publishedCourseCount} label="Published courses" href="/admin/courses" />
        <StatCard icon={Users} tone="accent" value={derived.trainees} label="Active trainees" href="/admin/users" />
        <StatCard icon={ClipboardList} tone="warning" value={derived.pending.length} label="Pending approvals" href="/admin/users?status=pending" />
        <StatCard icon={Award} value={derived.cohort} label="Cohort size (demo)" href="/admin/participation" />
      </div>

      {derived.pending.length > 0 ? (
        <Card className="flex flex-wrap items-center gap-3 border-warning/50 bg-warning-soft/40 p-4">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[var(--radius-sm)] bg-warning-soft text-warning">
            <Hourglass size={18} strokeWidth={1.75} />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-ink">
              {derived.pending.length} account{derived.pending.length > 1 ? "s" : ""} awaiting approval
            </p>
            <p className="text-xs text-ink-secondary">
              {derived.pending.map((a) => a.name).join(", ")} — review role and status before activating.
            </p>
          </div>
          <Link href="/admin/users?status=pending" className={buttonClassName("primary", "sm")}>
            Review now
            <ArrowRight size={14} strokeWidth={2} />
          </Link>
        </Card>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-2">
        <section aria-labelledby="broadcast">
          <div className="mb-3 flex items-center justify-between">
            <h2 id="broadcast" className="text-sm font-semibold text-ink">
              Broadcasts
            </h2>
            <Link href="/admin/announcements" className="text-xs font-medium text-primary hover:underline">
              Manage
            </Link>
          </div>
          <Card className="divide-y divide-[var(--color-border)]">
            {announcements.length === 0 ? (
              <div className="px-5 py-4">
                <p className="text-sm text-ink-secondary">No admin announcements published yet.</p>
                <p className="mt-1 text-xs text-ink-muted">
                  Announcements you publish reach trainees as notifications.
                </p>
              </div>
            ) : (
              announcements.slice(0, 3).map((announcement) => (
                <div key={announcement.id} className="flex items-start gap-3 px-5 py-3.5">
                  <Megaphone size={15} strokeWidth={1.75} className="mt-0.5 shrink-0 text-info" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-ink">{announcement.title}</p>
                    <p className="text-xs text-ink-muted">{formatDate(announcement.publishedAt)}</p>
                  </div>
                </div>
              ))
            )}
            <div className="px-5 py-3.5">
              <p className="text-xs text-ink-muted">
                {contentPosts.length} new-content note{contentPosts.length === 1 ? "" : "s"} published
              </p>
            </div>
          </Card>
        </section>

        <section aria-labelledby="catalog-health">
          <div className="mb-3 flex items-center justify-between">
            <h2 id="catalog-health" className="text-sm font-semibold text-ink">
              Catalog health
            </h2>
            <Link href="/admin/participation" className="text-xs font-medium text-primary hover:underline">
              Participation
            </Link>
          </div>
          <Card className="divide-y divide-[var(--color-border)]">
            {COURSES.slice(0, 4).map((course) => {
              const stats = participationFor(course);
              return (
                <div key={course.id} className="flex items-center gap-3 px-5 py-3.5">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-ink">{course.title}</p>
                    <p className="text-xs text-ink-muted">
                      <span className="font-mono tabular-nums">{course.code}</span> · {stats.traineeCount} trainees · mean {stats.meanProgress}%
                    </p>
                  </div>
                  {stats.atRiskCount > 0 ? (
                    <Badge tone="warning">{stats.atRiskCount} inactive</Badge>
                  ) : (
                    <Badge tone="success">On track</Badge>
                  )}
                </div>
              );
            })}
          </Card>
        </section>
      </div>

      <div className="flex items-center justify-between border-t border-border pt-4">
        <p className="text-xs text-ink-muted">
          Demo mode: oversight data is derived from deterministic demo cohorts and browser-local state.
        </p>
        <ResetDemoButton />
      </div>
    </div>
  );
}

function ResetDemoButton() {
  const { resetDemo } = useAdminStore();
  return (
    <button
      type="button"
      onClick={resetDemo}
      className="text-xs text-ink-muted underline-offset-2 hover:text-ink hover:underline"
    >
      Reset demo broadcasts
    </button>
  );
}
