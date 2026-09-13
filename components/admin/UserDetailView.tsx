"use client";

import Link from "next/link";
import { ArrowLeft, CircleCheck, Ban } from "lucide-react";
import type { SessionUser } from "@/lib/auth/types";
import type { CohortTrainee } from "@/lib/data/demo/cohort";
import { setAccountRole, setAccountStatus } from "@/lib/auth/actions";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Button } from "@/components/ui/Button";

/**
 * Admin view of one account: identity, lifecycle controls, and — for
 * demo-cohort trainees — their participation record.
 */
export function UserDetailView({
  account,
  cohortEntry,
  trainerId,
}: {
  account: SessionUser;
  cohortEntry?: CohortTrainee;
  trainerId?: string;
}) {
  const statusTone = account.status === "active" ? "success" : account.status === "pending" ? "warning" : "error";

  return (
    <div className="flex flex-col gap-5">
      <Link
        href="/admin/users"
        className="flex w-fit items-center gap-1.5 text-sm text-ink-secondary transition-colors hover:text-ink"
      >
        <ArrowLeft size={15} strokeWidth={1.75} />
        Users
      </Link>

      <PageHeader
        title={account.name}
        lead={account.title}
        actions={
          <div className="flex items-center gap-2">
            <Badge tone={account.role === "admin" ? "error" : account.role === "trainer" ? "info" : "neutral"}>
              {account.role}
            </Badge>
            <Badge tone={statusTone}>{account.status}</Badge>
          </div>
        }
      />

      <div className="grid items-start gap-4 lg:grid-cols-[1fr_300px]">
        <div className="flex flex-col gap-4">
          <Card className="flex flex-col gap-4 p-5">
            <h2 className="text-sm font-semibold text-ink">Account</h2>
            <dl className="grid gap-3 text-xs sm:grid-cols-2">
              <div className="rounded-[var(--radius-sm)] bg-surface-sunken px-3 py-2">
                <dt className="text-ink-muted">Email</dt>
                <dd className="mt-0.5 font-medium text-ink">{account.email}</dd>
              </div>
              <div className="rounded-[var(--radius-sm)] bg-surface-sunken px-3 py-2">
                <dt className="text-ink-muted">Account id</dt>
                <dd className="mt-0.5 font-mono tabular-nums font-medium text-ink">{account.id}</dd>
              </div>
              <div className="rounded-[var(--radius-sm)] bg-surface-sunken px-3 py-2">
                <dt className="text-ink-muted">Initials</dt>
                <dd className="mt-0.5 font-mono tabular-nums font-medium text-ink">{account.initials}</dd>
              </div>
              <div className="rounded-[var(--radius-sm)] bg-surface-sunken px-3 py-2">
                <dt className="text-ink-muted">Source</dt>
                <dd className="mt-0.5 font-medium text-ink">Demo account registry</dd>
              </div>
            </dl>
          </Card>

          {cohortEntry ? (
            <Card className="flex flex-col gap-3 p-5">
              <h2 className="text-sm font-semibold text-ink">Participation record</h2>
              <ul className="flex flex-col gap-3">
                {Object.entries(cohortEntry.progress).map(([courseId, progress]) => {
                  const score = cohortEntry.scores[courseId];
                  return (
                    <li key={courseId} className="flex items-center gap-3">
                      <span className="w-24 shrink-0 font-mono text-xs tabular-nums text-ink">{courseId}</span>
                      <ProgressBar value={progress} size="sm" className="flex-1" />
                      {score !== undefined ? <Badge tone={score >= 60 ? "success" : "warning"}>{score}%</Badge> : null}
                    </li>
                  );
                })}
              </ul>
              <p className="text-[11px] text-ink-muted">
                Last platform activity: {new Date(cohortEntry.lastActiveAt).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "short",
                })}
              </p>
            </Card>
          ) : null}
        </div>

        <div className="flex flex-col gap-3">
          <Card className="flex flex-col gap-3 p-5">
            <h2 className="text-sm font-semibold text-ink">Lifecycle</h2>
            <div className="flex flex-col gap-2">
              {account.status !== "active" ? (
                <form action={setAccountStatus}>
                  <input type="hidden" name="email" value={account.email} />
                  <input type="hidden" name="status" value="active" />
                  <Button size="sm" className="w-full">
                    <CircleCheck size={14} strokeWidth={1.75} />
                    {account.status === "pending" ? "Approve account" : "Reinstate account"}
                  </Button>
                </form>
              ) : null}
              {account.status !== "disabled" ? (
                <form action={setAccountStatus}>
                  <input type="hidden" name="email" value={account.email} />
                  <input type="hidden" name="status" value="disabled" />
                  <Button size="sm" variant="secondary" className="w-full">
                    <Ban size={14} strokeWidth={1.75} />
                    Disable account
                  </Button>
                </form>
              ) : null}
            </div>
            <p className="text-[11px] leading-relaxed text-ink-muted">
              Disabled accounts are blocked at sign-in and lose access immediately.
            </p>
          </Card>

          <Card className="flex flex-col gap-3 p-5">
            <h2 className="text-sm font-semibold text-ink">Role</h2>
            <form action={setAccountRole} className="flex items-center gap-2">
              <input type="hidden" name="email" value={account.email} />
              <select
                name="role"
                defaultValue={account.role}
                aria-label={`Role for ${account.name}`}
                className="h-9 flex-1 rounded-[var(--radius-sm)] border border-border-strong bg-surface px-2.5 text-sm text-ink focus:border-primary focus:outline-none"
              >
                <option value="trainee">trainee</option>
                <option value="trainer">trainer</option>
                <option value="admin">admin</option>
              </select>
              <Button size="sm" variant="secondary" type="submit">
                Set
              </Button>
            </form>
            <p className="text-[11px] leading-relaxed text-ink-muted">
              Changing role routes the account to the matching workspace at next sign-in.
            </p>
          </Card>

          {trainerId ? (
            <Card className="flex flex-col gap-2 p-5">
              <h2 className="text-sm font-semibold text-ink">Trainer profile</h2>
              <p className="text-xs leading-relaxed text-ink-secondary">
                This account has a trainer profile with portfolio and cohort outcomes.
              </p>
              <Link href={`/admin/trainers/${trainerId}`} className="text-xs font-semibold text-primary hover:underline">
                View trainer record
              </Link>
            </Card>
          ) : null}
        </div>
      </div>
    </div>
  );
}
