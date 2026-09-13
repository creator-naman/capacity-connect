"use client";

import { useMemo, useState } from "react";
import { MessageSquare, Star, CircleCheck } from "lucide-react";
import { getCourse } from "@/lib/data/demo/courses";
import { useDemoStore } from "@/lib/store/demo-store";
import { PageHeader } from "@/components/ui/PageHeader";
import { PageSkeleton } from "@/components/ui/Skeleton";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Textarea";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatDateTime } from "@/lib/format";

/**
 * Course feedback: a 1–5 rating plus relevance and trainer comments for any
 * enrolled course. Resubmitting updates the earlier response.
 */
export function FeedbackView() {
  const { state, hydrated, submitFeedback } = useDemoStore();

  const enrolledCourses = useMemo(
    () =>
      state.enrollments
        .map((e) => getCourse(e.courseId))
        .filter((c): c is NonNullable<typeof c> => Boolean(c)),
    [state.enrollments]
  );

  const [courseId, setCourseId] = useState(enrolledCourses[0]?.id ?? "");
  const existing = state.feedback.find((f) => f.courseId === courseId);

  const [rating, setRating] = useState(existing?.rating ?? 0);
  const [relevance, setRelevance] = useState(existing?.relevanceComment ?? "");
  const [trainer, setTrainer] = useState(existing?.trainerComment ?? "");
  const [error, setError] = useState<string | undefined>();
  const [saved, setSaved] = useState(false);
  // Whether this submission updated a prior review — captured at submit time,
  // because `existing` becomes true the moment the store records it.
  const [wasExisting, setWasExisting] = useState(false);

  if (!hydrated) return <PageSkeleton withStats={false} />;

  if (enrolledCourses.length === 0) {
    return (
      <div className="flex flex-col gap-5">
        <PageHeader title="Feedback" lead="Share feedback on course relevance and training quality." />
        <EmptyState
          icon={MessageSquare}
          title="Nothing to review yet"
          description="Feedback opens once you enroll in a course — your experience is what shapes the catalog."
        />
      </div>
    );
  }

  const selectCourse = (nextId: string) => {
    const prior = state.feedback.find((f) => f.courseId === nextId);
    setCourseId(nextId);
    setRating(prior?.rating ?? 0);
    setRelevance(prior?.relevanceComment ?? "");
    setTrainer(prior?.trainerComment ?? "");
    setError(undefined);
    setSaved(false);
  };

  const handleSubmit = () => {
    if (!courseId) {
      setError("Choose a course to review.");
      return;
    }
    if (rating === 0) {
      setError("Select an overall rating from 1 to 5.");
      return;
    }
    if (relevance.trim().length < 10) {
      setError("Please describe relevance in at least 10 characters.");
      return;
    }
    setError(undefined);
    setWasExisting(Boolean(existing));
    submitFeedback(courseId, rating, relevance.trim(), trainer.trim());
    setSaved(true);
  };

  return (
    <div className="flex flex-col gap-5">
      <PageHeader title="Feedback" lead="Share feedback on course relevance and training quality." />

      <div className="grid items-start gap-4 lg:grid-cols-[1fr_300px]">
        <Card className="flex flex-col gap-5 p-6">
          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-medium text-ink">Course</span>
            <select
              value={courseId}
              onChange={(event) => selectCourse(event.target.value)}
              className="h-10 w-full rounded-[var(--radius-sm)] border border-border-strong bg-surface px-3 text-sm text-ink focus:border-primary focus:outline-none"
            >
              {enrolledCourses.map((course) => (
                <option key={course.id} value={course.id}>
                  {course.code} — {course.title}
                </option>
              ))}
            </select>
          </label>

          <fieldset>
            <legend className="text-sm font-medium text-ink">Overall rating</legend>
            <div role="radiogroup" aria-label="Overall rating from 1 to 5" className="mt-2 flex items-center gap-1.5">
              {[1, 2, 3, 4, 5].map((value) => (
                <button
                  key={value}
                  type="button"
                  role="radio"
                  aria-checked={rating === value}
                  aria-label={`${value} star${value > 1 ? "s" : ""}`}
                  onClick={() => {
                    setRating(value);
                    setSaved(false);
                  }}
                  className={
                    "flex h-10 w-10 items-center justify-center rounded-[var(--radius-sm)] border transition-colors duration-150 " +
                    (rating >= value
                      ? "border-warning bg-warning-soft text-warning"
                      : "border-border-strong text-ink-muted hover:border-ink-muted")
                  }
                >
                  <Star size={17} strokeWidth={1.75} fill={rating >= value ? "currentColor" : "none"} />
                </button>
              ))}
              <span className="ml-2 text-xs text-ink-muted">
                {["", "Poor", "Fair", "Good", "Very good", "Excellent"][rating] || "Select"}
              </span>
            </div>
          </fieldset>

          <Textarea
            label="Course relevance"
            hint="How well did the content map to your operational work?"
            rows={3}
            value={relevance}
            onChange={(event) => {
              setRelevance(event.target.value);
              setSaved(false);
            }}
          />
          <Textarea
            label="Trainer and delivery"
            hint="Optional — clarity, pacing, materials, lab sessions."
            rows={3}
            value={trainer}
            onChange={(event) => {
              setTrainer(event.target.value);
              setSaved(false);
            }}
          />

          {error ? (
            <p role="alert" className="rounded-[var(--radius-sm)] bg-error-soft px-3 py-2 text-sm font-medium text-error">
              {error}
            </p>
          ) : null}
          {saved ? (
            <p role="status" className="flex items-center gap-1.5 rounded-[var(--radius-sm)] bg-success-soft px-3 py-2 text-sm font-medium text-success">
              <CircleCheck size={15} strokeWidth={1.75} />
              {wasExisting ? "Feedback updated. Thank you." : "Feedback submitted. Thank you."}
            </p>
          ) : null}

          <div className="flex items-center gap-2">
            <Button onClick={handleSubmit}>{existing ? "Update feedback" : "Submit feedback"}</Button>
            {existing ? (
              <span className="text-xs text-ink-muted">
                You reviewed this course on {formatDateTime(existing.submittedAt)} — submitting again updates it.
              </span>
            ) : null}
          </div>
        </Card>

        {/* Submitted feedback */}
        <section aria-labelledby="submitted-feedback" className="flex flex-col gap-3">
          <h2 id="submitted-feedback" className="text-sm font-semibold text-ink">
            Your submitted feedback
          </h2>
          {state.feedback.length === 0 ? (
            <Card className="p-4">
              <p className="text-xs leading-relaxed text-ink-muted">
                Nothing submitted yet. Reviews appear here and inform the training division&apos;s catalog
                planning.
              </p>
            </Card>
          ) : (
            state.feedback.map((entry) => {
              const course = getCourse(entry.courseId);
              return (
                <Card key={entry.courseId} className="flex flex-col gap-2 p-4">
                  <div className="flex items-center justify-between gap-2">
                    <p className="truncate text-xs font-semibold text-ink">
                      {course?.code} — {course?.title}
                    </p>
                    <Badge tone="warning">{entry.rating}/5</Badge>
                  </div>
                  <p className="line-clamp-3 text-xs leading-relaxed text-ink-secondary">
                    {entry.relevanceComment}
                  </p>
                  <p className="text-[11px] text-ink-muted">{formatDateTime(entry.submittedAt)}</p>
                </Card>
              );
            })
          )}
        </section>
      </div>
    </div>
  );
}
