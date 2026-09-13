"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowLeft, Plus, X } from "lucide-react";
import type { Questionnaire, QuestionnaireQuestion } from "@/lib/types/domain";
import { useTrainerStore } from "@/lib/store/trainer-store";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button, buttonClassName } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";

interface QuestionDraft {
  key: string;
  prompt: string;
  type: QuestionnaireQuestion["type"];
  options: string[];
}

const TYPE_LABEL: Record<QuestionnaireQuestion["type"], string> = {
  rating: "Rating (1–5)",
  text: "Free text",
  choice: "Multiple choice",
};

/** Questionnaire builder: metadata, deadline, and typed question list. */
export function QuestionnaireCreateForm({ trainerName }: { trainerName: string }) {
  const router = useRouter();
  const { createQuestionnaire } = useTrainerStore();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [deadline, setDeadline] = useState("");
  const [questions, setQuestions] = useState<QuestionDraft[]>([]);
  const [error, setError] = useState<string | undefined>();
  const [submitting, setSubmitting] = useState(false);

  const addQuestion = () => {
    setQuestions((prev) => [
      ...prev,
      { key: `q-${Date.now()}`, prompt: "", type: "rating", options: [] },
    ]);
  };

  const patchQuestion = (key: string, patch: Partial<QuestionDraft>) => {
    setQuestions((prev) => prev.map((q) => (q.key === key ? { ...q, ...patch } : q)));
  };

  const submit = () => {
    if (title.trim().length < 5) {
      setError("Give the questionnaire a clear title.");
      return;
    }
    if (!deadline) {
      setError("Set a response deadline.");
      return;
    }
    if (questions.length === 0 || questions.some((q) => q.prompt.trim().length < 5)) {
      setError("Add at least one question; every question needs a prompt.");
      return;
    }
    const invalidChoice = questions.find((q) => q.type === "choice" && q.options.length < 2);
    if (invalidChoice) {
      setError("Multiple-choice questions need at least two options.");
      return;
    }
    setError(undefined);
    setSubmitting(true);

    const questionnaire: Questionnaire = {
      id: `qre-${Math.random().toString(36).slice(2, 8)}`,
      title: title.trim(),
      description: description.trim() || "Please respond before the deadline.",
      trainerName,
      deadline,
      questions: questions.map((q, index) => ({
        id: `q${index + 1}`,
        prompt: q.prompt.trim(),
        type: q.type,
        ...(q.type === "choice" ? { options: q.options } : {}),
      })),
    };

    createQuestionnaire(questionnaire);
    router.push("/trainer/questionnaires");
  };

  return (
    <div className="flex flex-col gap-5">
      <Link
        href="/trainer/questionnaires"
        className="flex w-fit items-center gap-1.5 text-sm text-ink-secondary transition-colors hover:text-ink"
      >
        <ArrowLeft size={15} strokeWidth={1.75} />
        Questionnaires
      </Link>

      <PageHeader
        title="Create a questionnaire"
        lead="Ratings quantify the cohort response; free text captures specifics."
      />

      <Card className="flex flex-col gap-5 p-6">
        <Input
          label="Title"
          value={title}
          placeholder="e.g. NWP-101 end-of-course feedback"
          onChange={(event) => setTitle(event.target.value)}
          required
        />
        <Textarea
          label="Description"
          rows={2}
          value={description}
          placeholder="Why you are asking and how responses will be used."
          onChange={(event) => setDescription(event.target.value)}
        />
        <Input
          label="Response deadline"
          type="date"
          value={deadline}
          onChange={(event) => setDeadline(event.target.value)}
          hint="Trainees see a countdown until this date."
          required
        />

        <div className="flex flex-col gap-3 border-t border-border pt-5">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-ink">Questions</p>
            <Button size="sm" variant="secondary" onClick={addQuestion}>
              <Plus size={14} strokeWidth={2} />
              Add question
            </Button>
          </div>

          {questions.map((question, index) => (
            <div key={question.key} className="rounded-[var(--radius-sm)] border border-border bg-surface-sunken/60 p-4">
              <div className="mb-3 flex items-center justify-between">
                <Badge tone="neutral">Question {index + 1}</Badge>
                <button
                  type="button"
                  aria-label={`Remove question ${index + 1}`}
                  onClick={() => setQuestions((prev) => prev.filter((q) => q.key !== question.key))}
                  className="flex h-7 w-7 items-center justify-center rounded-[var(--radius-sm)] text-ink-muted transition-colors hover:bg-error-soft hover:text-error"
                >
                  <X size={14} strokeWidth={2} />
                </button>
              </div>
              <Input
                label="Prompt"
                value={question.prompt}
                placeholder="e.g. How clear were the recorded lectures?"
                onChange={(event) => patchQuestion(question.key, { prompt: event.target.value })}
              />
              <div className="mt-3">
                <Select
                  label="Answer type"
                  value={question.type}
                  options={(Object.keys(TYPE_LABEL) as QuestionnaireQuestion["type"][]).map((t) => ({
                    value: t,
                    label: TYPE_LABEL[t],
                  }))}
                  onChange={(event) =>
                    patchQuestion(question.key, { type: event.target.value as QuestionDraft["type"] })
                  }
                />
              </div>
              {question.type === "choice" ? (
                <div className="mt-3 flex flex-col gap-2">
                  <p className="text-sm font-medium text-ink">Options</p>
                  {question.options.map((option, oi) => (
                    <div key={`${question.key}-opt-${oi}`} className="flex items-center gap-2">
                      <input
                        type="text"
                        value={option}
                        aria-label={`Option ${oi + 1}`}
                        onChange={(event) =>
                          patchQuestion(question.key, {
                            options: question.options.map((o, i) => (i === oi ? event.target.value : o)),
                          })
                        }
                        className="h-9 w-full rounded-[var(--radius-sm)] border border-border-strong bg-surface px-3 text-sm text-ink focus:border-primary focus:outline-none"
                      />
                      <button
                        type="button"
                        aria-label={`Remove option ${oi + 1}`}
                        onClick={() =>
                          patchQuestion(question.key, {
                            options: question.options.filter((_, i) => i !== oi),
                          })
                        }
                        className="text-ink-muted transition-colors hover:text-error"
                      >
                        <X size={14} strokeWidth={2} />
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => patchQuestion(question.key, { options: [...question.options, ""] })}
                    className="flex w-fit items-center gap-1 text-xs font-semibold text-primary hover:underline"
                  >
                    <Plus size={13} strokeWidth={2} />
                    Add option
                  </button>
                </div>
              ) : null}
            </div>
          ))}
        </div>

        {error ? (
          <p role="alert" className="rounded-[var(--radius-sm)] bg-error-soft px-3 py-2 text-sm font-medium text-error">
            {error}
          </p>
        ) : null}

        <div className="flex items-center gap-2 border-t border-border pt-4">
          <Button onClick={submit} disabled={submitting}>
            {submitting ? "Publishing…" : "Publish questionnaire"}
          </Button>
          <Link href="/trainer/questionnaires" className={buttonClassName("ghost", "md")}>
            Cancel
          </Link>
        </div>
      </Card>
    </div>
  );
}
