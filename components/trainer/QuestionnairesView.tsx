"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { FilePen, Plus, Hourglass, Star, Quote } from "lucide-react";
import type { Questionnaire } from "@/lib/types/domain";
import { useTrainerStore } from "@/lib/store/trainer-store";
import { responsesForQuestionnaire } from "@/lib/data/demo/cohort";
import { PageHeader } from "@/components/ui/PageHeader";
import { PageSkeleton } from "@/components/ui/Skeleton";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button, buttonClassName } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatDate, relativeDays } from "@/lib/format";

/**
 * Trainer questionnaires with deadlines and collected responses. Responses
 * are demo-generated per questionnaire; the compose flow lives at
 * /trainer/questionnaires/create.
 */
export function QuestionnairesView() {
  const { state, hydrated } = useTrainerStore();
  const [active, setActive] = useState<Questionnaire | null>(null);

  const sorted = useMemo(
    () =>
      state.questionnaires
        .slice()
        .sort((a, b) => (a.deadline < b.deadline ? -1 : 1)),
    [state.questionnaires]
  );

  if (!hydrated) return <PageSkeleton withStats={false} />;

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title="Questionnaires"
        lead="Structured check-ins and training-needs surveys with deadlines."
        actions={
          <Link href="/trainer/questionnaires/create" className={buttonClassName("primary", "sm") + " gap-1.5"}>
            <Plus size={14} strokeWidth={2} />
            New questionnaire
          </Link>
        }
      />

      {sorted.length === 0 ? (
        <EmptyState
          icon={FilePen}
          title="No questionnaires yet"
          description="Publish a questionnaire to gather structured feedback from your cohort."
          action={
            <Link href="/trainer/questionnaires/create" className={buttonClassName("primary", "sm")}>
              Create one
            </Link>
          }
        />
      ) : (
        <div className="flex flex-col gap-3">
          {sorted.map((questionnaire) => {
            const responses = responsesForQuestionnaire(questionnaire.id);
            const closed = new Date(questionnaire.deadline) < new Date();
            const meanRating = responses.length
              ? (responses.reduce((sum, r) => sum + r.meanRating, 0) / responses.length).toFixed(1)
              : null;
            return (
              <Card key={questionnaire.id} className="flex flex-col gap-3 p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h2 className="text-sm font-semibold text-ink">{questionnaire.title}</h2>
                    <p className="mt-0.5 line-clamp-1 text-xs text-ink-secondary">{questionnaire.description}</p>
                  </div>
                  {closed ? (
                    <Badge tone="neutral">Closed</Badge>
                  ) : (
                    <Badge tone="warning">
                      <Hourglass size={12} strokeWidth={1.75} className="mr-1" />
                      Due {relativeDays(questionnaire.deadline)}
                    </Badge>
                  )}
                </div>
                <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 border-t border-border pt-3 text-xs text-ink-muted">
                  <span>{questionnaire.questions.length} questions</span>
                  <span>Deadline {formatDate(questionnaire.deadline)}</span>
                  <span>
                    {responses.length} response{responses.length === 1 ? "" : "s"}
                    {meanRating ? (
                      <span className="ml-2 inline-flex items-center gap-1 font-mono tabular-nums text-warning">
                        <Star size={11} strokeWidth={2} fill="currentColor" />
                        {meanRating}/5 avg
                      </span>
                    ) : null}
                  </span>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="ml-auto"
                    onClick={() => setActive(questionnaire)}
                    disabled={responses.length === 0}
                  >
                    View responses
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <ResponsesModal questionnaire={active} onClose={() => setActive(null)} />
    </div>
  );
}

function ResponsesModal({
  questionnaire,
  onClose,
}: {
  questionnaire: Questionnaire | null;
  onClose: () => void;
}) {
  const responses = useMemo(
    () => (questionnaire ? responsesForQuestionnaire(questionnaire.id) : []),
    [questionnaire]
  );

  return (
    <Modal
      open={Boolean(questionnaire)}
      onClose={onClose}
      title={questionnaire ? `Responses — ${questionnaire.title}` : "Responses"}
      size="lg"
    >
      <div className="flex flex-col gap-4">
        {responses.map((response) => (
          <div key={response.traineeName} className="rounded-[var(--radius-sm)] border border-border p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-sm font-medium text-ink">{response.traineeName}</p>
              <span className="flex items-center gap-1 font-mono text-xs tabular-nums text-warning">
                <Star size={12} strokeWidth={2} fill="currentColor" />
                {response.meanRating}/5
              </span>
            </div>
            <p className="text-[11px] text-ink-muted">
              {response.region} · submitted {formatDate(response.submittedAt)}
            </p>
            {response.freeText.map((text) => (
              <p key={text} className="mt-2 flex gap-2 text-xs leading-relaxed text-ink-secondary">
                <Quote size={12} strokeWidth={1.75} className="mt-0.5 shrink-0 text-ink-muted" />
                {text}
              </p>
            ))}
          </div>
        ))}
        {responses.length === 0 ? (
          <p className="text-sm text-ink-secondary">No responses yet.</p>
        ) : null}
      </div>
    </Modal>
  );
}
