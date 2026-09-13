"use client";

import { useMemo, useState } from "react";
import { Compass, CircleCheck, Circle, Info } from "lucide-react";
import { COMPETENCIES } from "@/lib/data/demo/portal";
import { matchTrainers } from "@/lib/data/demo/matching";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { EmptyState } from "@/components/ui/EmptyState";

/**
 * Competency mapping: subject → required skills → candidate trainers with an
 * explainable suitability score. Every factor is shown; nothing is a black
 * box number. Matching is deterministic (see lib/data/demo/matching.ts).
 */
export function CompetencyMappingView() {
  const [requirementId, setRequirementId] = useState(COMPETENCIES[0]?.id ?? "");
  const requirement = COMPETENCIES.find((r) => r.id === requirementId);
  const matches = useMemo(
    () => (requirement ? matchTrainers(requirement) : []),
    [requirement]
  );

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title="Competency Mapping"
        lead="Identify suitable trainers for a subject. Suitability is fully explainable — hover or read the factor breakdown."
      />

      <Card className="flex flex-col gap-2 p-5">
        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-medium text-ink">Subject requirement</span>
          <select
            value={requirementId}
            onChange={(event) => setRequirementId(event.target.value)}
            className="h-10 w-full rounded-[var(--radius-sm)] border border-border-strong bg-surface px-3 text-sm text-ink focus:border-primary focus:outline-none sm:max-w-xl"
          >
            {COMPETENCIES.map((r) => (
              <option key={r.id} value={r.id}>
                {r.subject}
              </option>
            ))}
          </select>
        </label>
        {requirement ? (
          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            <span className="text-xs text-ink-muted">Required skills:</span>
            {requirement.skills.map((skill) => (
              <Badge key={skill} tone="info">
                {skill}
              </Badge>
            ))}
            <Badge tone="neutral">≥ {requirement.minYearsExperience} yrs experience</Badge>
          </div>
        ) : null}
      </Card>

      {matches.length === 0 || !requirement ? (
        <EmptyState
          icon={Compass}
          title="No requirement selected"
          description="Choose a subject requirement to see ranked candidate trainers."
        />
      ) : (
        <div className="flex flex-col gap-3">
          {matches.map((match, index) => (
            <Card key={match.trainer.id} className="flex flex-col gap-3 p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    {index === 0 ? <Badge tone="accent">Best match</Badge> : null}
                    <h2 className="text-sm font-semibold text-ink">{match.trainer.name}</h2>
                  </div>
                  <p className="mt-0.5 text-xs text-ink-muted">
                    {match.trainer.title} · {match.trainer.specialisation}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-mono text-2xl font-medium tabular-nums text-ink">{match.score}</p>
                  <p className="text-[11px] text-ink-muted">suitability / 100</p>
                </div>
              </div>

              <ProgressBar value={match.score} size="sm" label="Suitability" />

              <ul className="flex flex-col gap-2 border-t border-border pt-3">
                {match.factors.map((factor) => {
                  const positive =
                    factor.detail.startsWith("matched") ||
                    factor.detail.includes("against a") ||
                    factor.detail.includes("Currently teaching");
                  const neutral = factor.label === "Experience vs requirement";
                  return (
                    <li key={factor.label} className="flex items-start gap-2 text-xs">
                      {positive && !neutral ? (
                        <CircleCheck size={13} strokeWidth={1.75} className="mt-0.5 shrink-0 text-success" />
                      ) : neutral ? (
                        <Info size={13} strokeWidth={1.75} className="mt-0.5 shrink-0 text-info" />
                      ) : (
                        <Circle size={13} strokeWidth={1.75} className="mt-0.5 shrink-0 text-ink-muted" />
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-ink">
                          {factor.label}{" "}
                          <span className="font-mono tabular-nums text-ink-muted">
                            ({Math.round(factor.weight * 100)}% weight)
                          </span>
                        </p>
                        <p className="text-ink-secondary">{factor.detail}</p>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
