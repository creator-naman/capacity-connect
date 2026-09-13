"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Search, UserRound, CircleCheck, Ban } from "lucide-react";
import type { SessionUser } from "@/lib/auth/types";
import type { Role } from "@/lib/types/nav";
import { setAccountRole, setAccountStatus } from "@/lib/auth/actions";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";

type StatusFilter = "all" | "active" | "pending" | "disabled";

const statusTone = {
  active: "success",
  pending: "warning",
  disabled: "error",
} as const;

/**
 * User approval and role management. Mutations go through server actions
 * over the account registry; a refresh follows each action. Admin role can
 * only be granted here — never via signup.
 */
export function UsersView({
  accounts,
  initialStatus,
}: {
  accounts: SessionUser[];
  initialStatus?: StatusFilter;
}) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<StatusFilter>(initialStatus ?? "all");
  const [roleFilter, setRoleFilter] = useState<"all" | Role>("all");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return accounts.filter((account) => {
      if (status !== "all" && account.status !== status) return false;
      if (roleFilter !== "all" && account.role !== roleFilter) return false;
      if (!q) return true;
      return (
        account.name.toLowerCase().includes(q) ||
        account.email.toLowerCase().includes(q) ||
        account.title.toLowerCase().includes(q)
      );
    });
  }, [accounts, query, status, roleFilter]);

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title="Users"
        lead="Approve sign-ups, manage account status, and assign roles."
      />

      <div className="flex flex-col gap-3">
        <label className="relative flex items-center">
          <Search size={16} strokeWidth={1.75} className="pointer-events-none absolute left-3 text-ink-muted" />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search by name, email, or designation…"
            aria-label="Search users"
            className="h-10 w-full rounded-[var(--radius-sm)] border border-border-strong bg-surface pl-9 pr-3 text-sm text-ink placeholder:text-ink-muted focus:border-primary focus:outline-none"
          />
        </label>
        <div className="flex flex-wrap items-center gap-1.5">
          {(["all", "pending", "active", "disabled"] as StatusFilter[]).map((s) => (
            <Chip key={s} label={s === "all" ? "All statuses" : s} active={status === s} onClick={() => setStatus(s)} />
          ))}
          <span className="mx-1 hidden h-5 w-px bg-border sm:block" aria-hidden="true" />
          {(["all", "trainee", "trainer", "admin"] as const).map((r) => (
            <Chip key={r} label={r === "all" ? "All roles" : r} active={roleFilter === r} onClick={() => setRoleFilter(r)} />
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={UserRound}
          title="No users match"
          description="Adjust the search or filters to find accounts."
        />
      ) : (
        <Card className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead>
              <tr className="border-b border-border text-xs text-ink-muted">
                <th scope="col" className="px-5 py-3 font-medium">Account</th>
                <th scope="col" className="px-5 py-3 font-medium">Role</th>
                <th scope="col" className="px-5 py-3 font-medium">Status</th>
                <th scope="col" className="px-5 py-3 font-medium">Status action</th>
                <th scope="col" className="px-5 py-3 font-medium">Role action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-border)]">
              {filtered.map((account) => (
                <tr key={account.email} className="align-middle text-ink-secondary">
                  <td className="px-5 py-3.5">
                    <Link href={`/admin/users/${encodeURIComponent(account.id)}`} className="group">
                      <p className="font-medium text-ink group-hover:text-primary">{account.name}</p>
                      <p className="text-xs text-ink-muted">{account.email}</p>
                      <p className="text-xs text-ink-muted">{account.title}</p>
                    </Link>
                  </td>
                  <td className="px-5 py-3.5">
                    <Badge tone={account.role === "admin" ? "error" : account.role === "trainer" ? "info" : "neutral"}>
                      {account.role}
                    </Badge>
                    <p className="mt-1 font-mono text-[10px] tabular-nums text-ink-muted">{account.id}</p>
                  </td>
                  <td className="px-5 py-3.5">
                    <Badge tone={statusTone[account.status]}>{account.status}</Badge>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-1.5">
                      {account.status !== "active" ? (
                        <form action={setAccountStatus}>
                          <input type="hidden" name="email" value={account.email} />
                          <input type="hidden" name="status" value="active" />
                          <Button size="sm" variant="secondary" title="Activate account">
                            <CircleCheck size={13} strokeWidth={1.75} />
                            {account.status === "pending" ? "Approve" : "Reinstate"}
                          </Button>
                        </form>
                      ) : null}
                      {account.status !== "disabled" ? (
                        <form action={setAccountStatus}>
                          <input type="hidden" name="email" value={account.email} />
                          <input type="hidden" name="status" value="disabled" />
                          <Button size="sm" variant="ghost" title="Disable account">
                            <Ban size={13} strokeWidth={1.75} />
                            Disable
                          </Button>
                        </form>
                      ) : null}
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    <form action={setAccountRole} className="flex items-center gap-1.5">
                      <input type="hidden" name="email" value={account.email} />
                      <select
                        name="role"
                        defaultValue={account.role}
                        aria-label={`Role for ${account.name}`}
                        className="h-8 rounded-[var(--radius-sm)] border border-border-strong bg-surface px-2 text-xs text-ink focus:border-primary focus:outline-none"
                      >
                        <option value="trainee">trainee</option>
                        <option value="trainer">trainer</option>
                        <option value="admin">admin</option>
                      </select>
                      <Button size="sm" variant="ghost" type="submit">
                        Set
                      </Button>
                    </form>
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
        "h-8 rounded-full border px-3.5 text-xs font-medium capitalize transition-colors duration-150 " +
        (active
          ? "border-primary bg-primary-soft text-primary"
          : "border-border-strong text-ink-secondary hover:border-ink-muted hover:text-ink")
      }
    >
      {label}
    </button>
  );
}
