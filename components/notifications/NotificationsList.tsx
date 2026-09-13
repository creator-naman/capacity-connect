"use client";

import { useRouter } from "next/navigation";
import { useMemo } from "react";
import {
  Bell,
  Megaphone,
  Award,
  Hourglass,
  Settings,
  Sparkle,
  CheckCheck,
} from "lucide-react";
import type { AppNotification, NotificationKind } from "@/lib/types/domain";
import { PageHeader } from "@/components/ui/PageHeader";
import { PageSkeleton } from "@/components/ui/Skeleton";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { relativeDays } from "@/lib/format";

const kindMeta: Record<NotificationKind, { icon: typeof Bell; tone: "info" | "success" | "warning" | "neutral" | "accent"; label: string }> = {
  announcement: { icon: Megaphone, tone: "info", label: "announcement" },
  achievement: { icon: Award, tone: "success", label: "achievement" },
  deadline: { icon: Hourglass, tone: "warning", label: "deadline" },
  system: { icon: Settings, tone: "neutral", label: "system" },
  content: { icon: Sparkle, tone: "accent", label: "content" },
};

/**
 * Shared notification centre for every role. Opening a linked notification
 * marks it read and navigates; items without a destination just mark read.
 * Role layouts pass their own store's notifications and mutators.
 */
export function NotificationsList({
  notifications,
  hydrated,
  markRead,
  markAllRead,
  title = "Notifications",
  lead = "Announcements, deadlines, and achievements.",
}: {
  notifications: AppNotification[];
  hydrated: boolean;
  markRead: (id: string) => void;
  markAllRead: () => void;
  title?: string;
  lead?: string;
}) {
  const router = useRouter();

  const { unread, read } = useMemo(() => {
    const sorted = notifications.slice().sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
    return {
      unread: sorted.filter((n) => !n.read),
      read: sorted.filter((n) => n.read),
    };
  }, [notifications]);

  if (!hydrated) return <PageSkeleton withStats={false} />;

  if (notifications.length === 0) {
    return (
      <div className="flex flex-col gap-5">
        <PageHeader title={title} lead={lead} />
        <EmptyState
          icon={Bell}
          title="No notifications"
          description="You're all caught up. New announcements and deadlines will appear here."
        />
      </div>
    );
  }

  const open = (id: string, href?: string) => {
    markRead(id);
    if (href) router.push(href);
  };

  const renderRow = (n: AppNotification, isUnread: boolean) => {
    const meta = kindMeta[n.kind];
    const Icon = meta.icon;
    return (
      <div key={n.id} className="flex items-start gap-3.5 px-5 py-4">
        <span
          className={
            "flex h-9 w-9 shrink-0 items-center justify-center rounded-[var(--radius-sm)] " +
            (isUnread ? "bg-primary-soft text-primary" : "bg-surface-sunken text-ink-muted")
          }
          aria-hidden="true"
        >
          <Icon size={17} strokeWidth={1.75} />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className={"text-sm " + (isUnread ? "font-semibold text-ink" : "font-medium text-ink-secondary")}>
              {n.title}
            </p>
            <Badge tone={meta.tone}>{meta.label}</Badge>
            {isUnread ? <span className="h-1.5 w-1.5 rounded-full bg-accent" aria-label="Unread" /> : null}
          </div>
          <p className="mt-1 text-xs leading-relaxed text-ink-secondary">{n.body}</p>
          <p className="mt-1.5 text-[11px] text-ink-muted">{relativeDays(n.createdAt)}</p>
        </div>
        <div className="shrink-0">
          {n.href ? (
            <button
              type="button"
              onClick={() => open(n.id, n.href)}
              className="text-xs font-semibold text-primary hover:underline"
            >
              Open
            </button>
          ) : isUnread ? (
            <button
              type="button"
              onClick={() => markRead(n.id)}
              className="text-xs font-medium text-ink-muted hover:text-ink"
            >
              Mark read
            </button>
          ) : null}
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title={title}
        lead={lead}
        actions={
          unread.length > 0 ? (
            <Button variant="secondary" size="sm" onClick={markAllRead}>
              <CheckCheck size={14} strokeWidth={1.75} />
              Mark all read
            </Button>
          ) : undefined
        }
      />

      {unread.length > 0 ? (
        <section aria-labelledby="unread-notifications">
          <h2 id="unread-notifications" className="mb-3 text-sm font-semibold text-ink">
            Unread{" "}
            <span className="ml-1 rounded-[var(--radius-sm)] bg-accent-soft px-1.5 py-0.5 font-mono text-[11px] tabular-nums text-accent">
              {unread.length}
            </span>
          </h2>
          <Card className="divide-y divide-[var(--color-border)]">
            {unread.map((n) => renderRow(n, true))}
          </Card>
        </section>
      ) : null}

      {read.length > 0 ? (
        <section aria-labelledby="earlier-notifications">
          <h2 id="earlier-notifications" className="mb-3 text-sm font-semibold text-ink">
            Earlier
          </h2>
          <Card className="divide-y divide-[var(--color-border)]">
            {read.map((n) => renderRow(n, false))}
          </Card>
        </section>
      ) : null}
    </div>
  );
}
