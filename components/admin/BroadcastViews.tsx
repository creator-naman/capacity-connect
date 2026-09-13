"use client";

import { useState } from "react";
import { Megaphone, Target, FileText, Send, Sparkle } from "lucide-react";
import { ANNOUNCEMENTS, ACHIEVEMENTS } from "@/lib/data/demo/portal";
import { COURSES } from "@/lib/data/demo/courses";
import { useAdminStore } from "@/lib/store/admin-store";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatDate } from "@/lib/format";

/**
 * Admin broadcasting. Published items land in the shared catalog and reach
 * trainees as notifications — the problem statement's announcement flow.
 */

function PublishForm({
  title,
  body,
  onTitle,
  onBody,
  onSubmit,
  submitLabel,
}: {
  title: string;
  body: string;
  onTitle: (v: string) => void;
  onBody: (v: string) => void;
  onSubmit: () => void;
  submitLabel: string;
}) {
  return (
    <div className="flex flex-col gap-3">
      <Input label="Title" value={title} placeholder="e.g. Monsoon 2026 cohort results are live" onChange={(e) => onTitle(e.target.value)} />
      <Textarea label="Message" rows={3} value={body} placeholder="What trainees and trainers should know." onChange={(e) => onBody(e.target.value)} />
      <div>
        <Button size="sm" onClick={onSubmit} disabled={title.trim().length < 4 || body.trim().length < 10}>
          <Send size={14} strokeWidth={1.75} />
          {submitLabel}
        </Button>
      </div>
    </div>
  );
}

export function AnnouncementsView() {
  const { announcements, publishAnnouncement, resetDemo } = useAdminStore();
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [saved, setSaved] = useState(false);

  const submit = () => {
    publishAnnouncement(title.trim(), body.trim());
    setTitle("");
    setBody("");
    setSaved(true);
    window.setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title="Announcements"
        lead="Platform-wide notices. Published items reach trainees as notifications."
        actions={
          <Button variant="ghost" size="sm" onClick={resetDemo}>
            Reset demo broadcasts
          </Button>
        }
      />

      <div className="grid items-start gap-4 lg:grid-cols-[1fr_320px]">
        <Card className="divide-y divide-[var(--color-border)]">
          {[...announcements.map((a) => ({ id: a.id, title: a.title, body: a.body, at: a.publishedAt, source: "Admin" as const })),
            ...ANNOUNCEMENTS.map((a) => ({ id: a.id, title: a.title, body: a.body, at: a.publishedAt, source: "Curated" as const }))].map(
            (item) => (
              <div key={item.id} className="flex items-start gap-3.5 px-5 py-4">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[var(--radius-sm)] bg-info-soft text-info">
                  <Megaphone size={17} strokeWidth={1.75} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-ink">{item.title}</p>
                  <p className="mt-0.5 text-xs leading-relaxed text-ink-secondary">{item.body}</p>
                  <p className="mt-1 text-[11px] text-ink-muted">{formatDate(item.at)}</p>
                </div>
                <Badge tone={item.source === "Admin" ? "accent" : "neutral"}>{item.source}</Badge>
              </div>
            )
          )}
        </Card>

        <Card className="flex flex-col gap-3 p-5">
          <h2 className="text-sm font-semibold text-ink">Publish an announcement</h2>
          <PublishForm title={title} body={body} onTitle={setTitle} onBody={setBody} onSubmit={submit} submitLabel="Publish" />
          {saved ? (
            <p role="status" className="text-xs font-medium text-success">
              Published — trainees will receive it as a notification.
            </p>
          ) : null}
        </Card>
      </div>
    </div>
  );
}

export function AchievementsView() {
  const { featureAchievement } = useAdminStore();
  const [spotlighted, setSpotlighted] = useState<string[]>([]);

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title="Achievements"
        lead="Platform achievement definitions. Spotlight one to broadcast it to trainees."
      />
      <div className="grid gap-4 sm:grid-cols-2">
        {ACHIEVEMENTS.map((achievement) => (
          <Card key={achievement.id} className="flex flex-col gap-3 p-5">
            <div className="flex items-start justify-between gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-[var(--radius-sm)] bg-accent-soft text-accent">
                <Target size={20} strokeWidth={1.75} />
              </span>
              {spotlighted.includes(achievement.id) ? <Badge tone="accent">Spotlighted</Badge> : null}
            </div>
            <div>
              <h2 className="text-sm font-semibold text-ink">{achievement.title}</h2>
              <p className="mt-0.5 text-xs leading-relaxed text-ink-secondary">{achievement.description}</p>
              <p className="mt-1.5 text-[11px] text-ink-muted">
                First earned {formatDate(achievement.earnedAt)}
              </p>
            </div>
            <Button
              size="sm"
              variant={spotlighted.includes(achievement.id) ? "ghost" : "secondary"}
              onClick={() => {
                if (spotlighted.includes(achievement.id)) return;
                featureAchievement(achievement.title, achievement.description);
                setSpotlighted((prev) => [...prev, achievement.id]);
              }}
            >
              <Sparkle size={14} strokeWidth={1.75} />
              Spotlight
            </Button>
          </Card>
        ))}
      </div>
    </div>
  );
}

export function ContentView() {
  const { contentPosts, publishContentPost } = useAdminStore();
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");

  const recent = [...COURSES]
    .sort((a, b) => (a.addedAt < b.addedAt ? 1 : -1))
    .slice(0, 5);

  const submit = () => {
    publishContentPost(title.trim(), body.trim(), "/trainee/explore");
    setTitle("");
    setBody("");
  };

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title="New Learning Content"
        lead="Highlight newly added courses and resources. Notes reach trainees as notifications."
      />

      <div className="grid items-start gap-4 lg:grid-cols-[1fr_320px]">
        <div className="flex flex-col gap-4">
          <Card className="divide-y divide-[var(--color-border)]">
            <div className="px-5 py-3.5">
              <p className="text-xs font-semibold uppercase tracking-wide text-ink-muted">Recently added courses</p>
            </div>
            {recent.map((course) => (
              <div key={course.id} className="flex items-center gap-3.5 px-5 py-3.5">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[var(--radius-sm)] bg-primary-soft text-primary">
                  <FileText size={17} strokeWidth={1.75} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-ink">{course.title}</p>
                  <p className="text-xs text-ink-muted">
                    <span className="font-mono tabular-nums">{course.code}</span> · added {formatDate(course.addedAt)}
                  </p>
                </div>
                <Badge tone="neutral">{course.category}</Badge>
              </div>
            ))}
          </Card>

          <Card className="divide-y divide-[var(--color-border)]">
            <div className="px-5 py-3.5">
              <p className="text-xs font-semibold uppercase tracking-wide text-ink-muted">Published content notes</p>
            </div>
            {contentPosts.length === 0 ? (
              <div className="px-5 py-4">
                <EmptyState
                  icon={FileText}
                  title="Nothing published yet"
                  description="Use the form to highlight new courses or resources to the cohort."
                />
              </div>
            ) : (
              contentPosts.map((post) => (
                <div key={post.id} className="flex items-start gap-3.5 px-5 py-3.5">
                  <Sparkle size={15} strokeWidth={1.75} className="mt-0.5 shrink-0 text-accent" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-ink">{post.title}</p>
                    <p className="mt-0.5 text-xs leading-relaxed text-ink-secondary">{post.body}</p>
                    <p className="mt-1 text-[11px] text-ink-muted">{formatDate(post.publishedAt)}</p>
                  </div>
                </div>
              ))
            )}
          </Card>
        </div>

        <Card className="flex flex-col gap-3 p-5">
          <h2 className="text-sm font-semibold text-ink">Publish a content note</h2>
          <PublishForm title={title} body={body} onTitle={setTitle} onBody={setBody} onSubmit={submit} submitLabel="Publish note" />
        </Card>
      </div>
    </div>
  );
}
