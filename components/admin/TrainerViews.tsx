"use client";

import Link from "next/link";
import { UserCog } from "lucide-react";
import { TRAINERS } from "@/lib/data/demo/portal";
import { COURSES } from "@/lib/data/demo/courses";
import { participationFor } from "@/lib/data/demo/cohort";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { EmptyState } from "@/components/ui/EmptyState";

/** Trainer management: roster with portfolio and cohort health. */
export function TrainersView() {
  return (
    <div className="flex flex-col gap-5">
      <PageHeader title="Trainers" lead="Trainer profiles, portfolios, and cohort outcomes." />
      <div className="grid gap-4 sm:grid-cols-2">
        {TRAINERS.map((trainer) => {
          const taught = COURSES.filter((course) => trainer.coursesTaught.includes(course.id));
          const meanProgress = taught.length
            ? Math.round(taught.reduce((sum, course) => sum + participationFor(course).meanProgress, 0) / taught.length)
            : 0;
          return (
            <Card key={trainer.id} className="flex h-full flex-col gap-3 p-5 transition-colors hover:border-border-strong">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <Link href={`/admin/trainers/${trainer.id}`} className="group">
                    <h2 className="text-sm font-semibold text-ink group-hover:text-primary">{trainer.name}</h2>
                  </Link>
                  <p className="mt-0.5 text-xs text-ink-muted">{trainer.title}</p>
                </div>
                <Badge tone="neutral">
                  <span className="font-mono tabular-nums">{trainer.yearsExperience}</span> yrs
                </Badge>
              </div>
              <p className="line-clamp-2 text-xs leading-relaxed text-ink-secondary">{trainer.bio}</p>
              <div className="flex flex-wrap gap-1">
                {trainer.expertise.slice(0, 3).map((area) => (
                  <Badge key={area} tone="info">
                    {area}
                  </Badge>
                ))}
                {trainer.expertise.length > 3 ? <Badge tone="neutral">+{trainer.expertise.length - 3}</Badge> : null}
              </div>
              <div className="mt-auto border-t border-border pt-3">
                {taught.length > 0 ? (
                  <ProgressBar value={meanProgress} size="sm" label="Cohort mean progress" />
                ) : (
                  <p className="text-xs text-ink-muted">No active courses in the catalog.</p>
                )}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

/** Trainer detail: profile, portfolio, and per-course cohort summary. */
export function TrainerDetailView({ trainerId }: { trainerId: string }) {
  const trainer = TRAINERS.find((t) => t.id === trainerId);
  if (!trainer) {
    return (
      <div className="flex flex-col gap-5">
        <PageHeader title="Trainer" />
        <EmptyState
          icon={UserCog}
          title="Trainer not found"
          description="The requested trainer profile does not exist."
          action={
            <Link href="/admin/trainers" className="text-sm font-medium text-primary hover:underline">
              Back to Trainers
            </Link>
          }
        />
      </div>
    );
  }

  const taught = COURSES.filter((course) => trainer.coursesTaught.includes(course.id));

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title={trainer.name}
        lead={trainer.title}
        actions={<Badge tone="neutral">{trainer.id}</Badge>}
      />

      <div className="grid items-start gap-4 lg:grid-cols-[1fr_280px]">
        <div className="flex flex-col gap-4">
          <Card className="flex flex-col gap-3 p-5">
            <h2 className="text-sm font-semibold text-ink">Profile</h2>
            <p className="text-sm leading-relaxed text-ink-secondary">{trainer.bio}</p>
            <dl className="grid grid-cols-2 gap-3 text-xs">
              <div className="rounded-[var(--radius-sm)] bg-surface-sunken px-3 py-2">
                <dt className="text-ink-muted">Specialisation</dt>
                <dd className="mt-0.5 font-medium text-ink">{trainer.specialisation}</dd>
              </div>
              <div className="rounded-[var(--radius-sm)] bg-surface-sunken px-3 py-2">
                <dt className="text-ink-muted">Experience</dt>
                <dd className="mt-0.5 font-mono tabular-nums font-medium text-ink">{trainer.yearsExperience} years</dd>
              </div>
            </dl>
            <div className="flex flex-wrap gap-1">
              {trainer.expertise.map((area) => (
                <Badge key={area} tone="info">
                  {area}
                </Badge>
              ))}
            </div>
          </Card>

          <Card className="divide-y divide-[var(--color-border)]">
            <div className="px-5 py-3.5">
              <p className="text-sm font-semibold text-ink">Courses</p>
            </div>
            {taught.length === 0 ? (
              <div className="px-5 py-4">
                <p className="text-sm text-ink-muted">No courses in the current catalog.</p>
              </div>
            ) : (
              taught.map((course) => {
                const stats = participationFor(course);
                return (
                  <div key={course.id} className="px-5 py-4">
                    <div className="flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-ink">{course.title}</p>
                        <p className="text-xs text-ink-muted">
                          <span className="font-mono tabular-nums">{course.code}</span> · {stats.traineeCount} trainees ·
                          attempt rate {stats.attemptRate}%
                        </p>
                      </div>
                      <Badge tone={stats.atRiskCount > 0 ? "warning" : "success"}>
                        {stats.atRiskCount > 0 ? `${stats.atRiskCount} inactive` : "On track"}
                      </Badge>
                    </div>
                    <ProgressBar value={stats.meanProgress} size="sm" className="mt-2.5" label="Mean progress" />
                  </div>
                );
              })
            )}
          </Card>
        </div>

        <Card className="flex flex-col gap-2 p-5">
          <h2 className="text-sm font-semibold text-ink">Competency standing</h2>
          <p className="text-xs leading-relaxed text-ink-secondary">
            This profile feeds competency mapping. {trainer.name} matches subject requirements through
            expertise overlap, experience, and their active teaching portfolio.
          </p>
          <Link href="/admin/competency-mapping" className="text-xs font-semibold text-primary hover:underline">
            Open competency mapping
          </Link>
        </Card>
      </div>
    </div>
  );
}
