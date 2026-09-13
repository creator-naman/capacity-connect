"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowLeft, Plus, X, CircleCheck } from "lucide-react";
import type { Course, CourseLevel, LearningResource } from "@/lib/types/domain";
import { COURSE_CATEGORIES } from "@/lib/data/demo/courses";
import { useTrainerStore } from "@/lib/store/trainer-store";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button, buttonClassName } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { formatMinutes } from "@/lib/format";

interface ModuleDraft {
  key: string;
  title: string;
  summary: string;
  minutes: string;
}

/**
 * Course authoring: catalogue fields, outcomes, and a module builder.
 * Modules save as curriculum rows; the course joins the trainer's portfolio
 * immediately (demo mode: stored locally per trainer account).
 */
export function CourseCreateForm({ trainerName }: { trainerName: string }) {
  const router = useRouter();
  const { createCourse } = useTrainerStore();

  const [title, setTitle] = useState("");
  const [code, setCode] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<string>("");
  const [subject, setSubject] = useState("");
  const [level, setLevel] = useState<CourseLevel>("beginner");
  const [outcomes, setOutcomes] = useState<string[]>([]);
  const [outcomeDraft, setOutcomeDraft] = useState("");
  const [modules, setModules] = useState<ModuleDraft[]>([]);
  const [error, setError] = useState<string | undefined>();
  const [submitting, setSubmitting] = useState<"draft" | "published" | null>(null);

  const totalMinutes = modules.reduce((sum, m) => sum + (Number(m.minutes) || 0), 0);

  const addOutcome = () => {
    const value = outcomeDraft.trim();
    if (!value) return;
    setOutcomes((prev) => [...prev, value]);
    setOutcomeDraft("");
  };

  const addModule = () => {
    setModules((prev) => [...prev, { key: `m-${Date.now()}`, title: "", summary: "", minutes: "45" }]);
  };

  const submit = (status: "draft" | "published") => {
    if (title.trim().length < 5) {
      setError("Give the course a descriptive title (at least 5 characters).");
      return;
    }
    if (description.trim().length < 20) {
      setError("Write a short description (at least 20 characters).");
      return;
    }
    if (!category) {
      setError("Choose a category for the catalog.");
      return;
    }
    if (modules.length === 0 || modules.some((m) => m.title.trim().length < 3)) {
      setError("Add at least one module; every module needs a title.");
      return;
    }
    setError(undefined);
    setSubmitting(status);

    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")
      .slice(0, 28);
    const courseId = `${slug}-${Math.random().toString(36).slice(2, 5)}`;
    const resolvedCode =
      code.trim().toUpperCase() ||
      `${category.slice(0, 3).toUpperCase()}-${100 + Math.floor(Math.random() * 300)}`;

    const course: Course = {
      id: courseId,
      code: resolvedCode,
      title: title.trim(),
      description: description.trim(),
      category,
      subject: subject.trim() || undefined,
      level,
      hours: Math.max(1, Math.round(totalMinutes / 60)),
      trainerId: "self",
      trainerName,
      outcomes,
      status,
      modules: modules.map((draft, index) => ({
        id: `${courseId}-m${index + 1}`,
        title: draft.title.trim(),
        summary: draft.summary.trim() || "Module details to be announced.",
        minutes: Number(draft.minutes) || 45,
        resources: [] as LearningResource[],
      })),
      addedAt: new Date().toISOString().slice(0, 10),
      tags: [category.toLowerCase(), level],
    };

    createCourse(course);
    router.push(`/trainer/courses/${courseId}`);
  };

  return (
    <div className="flex flex-col gap-5">
      <Link
        href="/trainer/courses"
        className="flex w-fit items-center gap-1.5 text-sm text-ink-secondary transition-colors hover:text-ink"
      >
        <ArrowLeft size={15} strokeWidth={1.75} />
        My Courses
      </Link>

      <PageHeader
        title="Create a course"
        lead="Published courses join your portfolio immediately and become manageable."
      />

      <Card className="flex flex-col gap-5 p-6">
        <div className="grid gap-4 sm:grid-cols-[1fr_180px]">
          <Input
            label="Course title"
            value={title}
            placeholder="e.g. Aviation Meteorology for Approach Controllers"
            onChange={(event) => setTitle(event.target.value)}
            required
          />
          <Input
            label="Course code"
            value={code}
            placeholder="Auto-generated if blank"
            hint="Shown across the catalog"
            onChange={(event) => setCode(event.target.value)}
          />
        </div>

        <Textarea
          label="Description"
          value={description}
          placeholder="What the course covers, who it serves, and how it connects to operational duties."
          rows={3}
          onChange={(event) => setDescription(event.target.value)}
          required
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <Select
            label="Category"
            value={category}
            placeholder="Select a catalog category"
            options={COURSE_CATEGORIES.map((c) => ({ value: c, label: c }))}
            onChange={(event) => setCategory(event.target.value)}
            required
          />
          <Input
            label="Subject"
            value={subject}
            placeholder="e.g. Terminal-area hazards"
            hint="Fine-grained subject used for competency mapping"
            onChange={(event) => setSubject(event.target.value)}
          />
        </div>
        <Select
          label="Level"
          value={level}
          options={[
            { value: "beginner", label: "Beginner" },
            { value: "intermediate", label: "Intermediate" },
            { value: "advanced", label: "Advanced" },
          ]}
          onChange={(event) => setLevel(event.target.value as CourseLevel)}
          required
        />

        {/* Outcomes */}
        <div className="flex flex-col gap-2">
          <p className="text-sm font-medium text-ink">Learning outcomes</p>
          {outcomes.length > 0 ? (
            <ul className="flex flex-col gap-1.5">
              {outcomes.map((outcome, index) => (
                <li key={outcome} className="flex items-center gap-2 text-sm text-ink-secondary">
                  <CircleCheck size={14} strokeWidth={1.75} className="shrink-0 text-accent" />
                  <span className="flex-1">{outcome}</span>
                  <button
                    type="button"
                    aria-label={`Remove outcome ${index + 1}`}
                    onClick={() => setOutcomes((prev) => prev.filter((o) => o !== outcome))}
                    className="text-ink-muted transition-colors hover:text-error"
                  >
                    <X size={14} strokeWidth={2} />
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-xs text-ink-muted">Optional — but outcomes guide competency mapping.</p>
          )}
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={outcomeDraft}
              placeholder="e.g. Apply Dvorak analysis to developing systems"
              aria-label="Add an outcome"
              onChange={(event) => setOutcomeDraft(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  addOutcome();
                }
              }}
              className="h-9 w-full rounded-[var(--radius-sm)] border border-border-strong bg-surface px-3 text-sm text-ink placeholder:text-ink-muted focus:border-primary focus:outline-none"
            />
            <Button size="sm" variant="secondary" onClick={addOutcome}>
              <Plus size={14} strokeWidth={2} />
              Add
            </Button>
          </div>
        </div>

        {/* Modules */}
        <div className="flex flex-col gap-3 border-t border-border pt-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-ink">Modules</p>
              <p className="text-xs text-ink-muted">
                {modules.length === 0
                  ? "Add the teaching units in delivery order."
                  : `${modules.length} module${modules.length > 1 ? "s" : ""} · ${formatMinutes(totalMinutes)} total contact time`}
              </p>
            </div>
            <Button size="sm" variant="secondary" onClick={addModule}>
              <Plus size={14} strokeWidth={2} />
              Add module
            </Button>
          </div>

          {modules.map((module, index) => (
            <div key={module.key} className="rounded-[var(--radius-sm)] border border-border bg-surface-sunken/60 p-4">
              <div className="mb-3 flex items-center justify-between">
                <Badge tone="neutral">Module {index + 1}</Badge>
                <button
                  type="button"
                  aria-label={`Remove module ${index + 1}`}
                  onClick={() => setModules((prev) => prev.filter((m) => m.key !== module.key))}
                  className="flex h-7 w-7 items-center justify-center rounded-[var(--radius-sm)] text-ink-muted transition-colors hover:bg-error-soft hover:text-error"
                >
                  <X size={14} strokeWidth={2} />
                </button>
              </div>
              <div className="grid gap-3 sm:grid-cols-[1fr_110px]">
                <Input
                  label="Module title"
                  value={module.title}
                  placeholder="e.g. Reading upper-air charts"
                  onChange={(event) =>
                    setModules((prev) =>
                      prev.map((m) => (m.key === module.key ? { ...m, title: event.target.value } : m))
                    )
                  }
                />
                <Input
                  label="Minutes"
                  type="number"
                  min={10}
                  value={module.minutes}
                  onChange={(event) =>
                    setModules((prev) =>
                      prev.map((m) => (m.key === module.key ? { ...m, minutes: event.target.value } : m))
                    )
                  }
                />
              </div>
              <Textarea
                label="Summary"
                rows={2}
                className="mt-3"
                value={module.summary}
                placeholder="One or two lines on what this module covers."
                onChange={(event) =>
                  setModules((prev) =>
                    prev.map((m) => (m.key === module.key ? { ...m, summary: event.target.value } : m))
                  )
                }
              />
            </div>
          ))}
        </div>

        {error ? (
          <p role="alert" className="rounded-[var(--radius-sm)] bg-error-soft px-3 py-2 text-sm font-medium text-error">
            {error}
          </p>
        ) : null}

        <div className="flex flex-wrap items-center gap-2 border-t border-border pt-4">
          <Button onClick={() => submit("published")} disabled={submitting !== null}>
            {submitting === "published" ? "Publishing…" : "Publish course"}
          </Button>
          <Button
            variant="secondary"
            onClick={() => submit("draft")}
            disabled={submitting !== null}
          >
            {submitting === "draft" ? "Saving…" : "Save as draft"}
          </Button>
          <Link href="/trainer/courses" className={buttonClassName("ghost", "md")}>
            Cancel
          </Link>
          <span className="ml-auto max-w-56 text-right text-xs text-ink-muted">
            Drafts stay private to you; published courses become visible to trainees immediately.
          </span>
        </div>
      </Card>
    </div>
  );
}
