"use client";

import { useState } from "react";
import { UserRound, GraduationCap, X, CircleCheck, Plus } from "lucide-react";
import { useTrainerStore } from "@/lib/store/trainer-store";
import { PageHeader } from "@/components/ui/PageHeader";
import { PageSkeleton } from "@/components/ui/Skeleton";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";

/** Professional trainer profile: identity, expertise, and biography. */
export function TrainerProfileView() {
  const { state, hydrated } = useTrainerStore();
  if (!hydrated) return <PageSkeleton withStats={false} />;
  return <TrainerProfileSections key={state.profile.id} />;
}

function TrainerProfileSections() {
  const { state, updateProfile } = useTrainerStore();
  const profile = state.profile;
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | undefined>();
  const [draft, setDraft] = useState({
    name: profile.name,
    title: profile.title,
    specialisation: profile.specialisation,
    yearsExperience: String(profile.yearsExperience),
    bio: profile.bio,
  });
  const [expertise, setExpertise] = useState<string[]>(profile.expertise);
  const [expertiseDraft, setExpertiseDraft] = useState("");

  const save = () => {
    const years = Number(draft.yearsExperience);
    if (draft.name.trim().length < 2) {
      setError("Enter your full name.");
      return;
    }
    if (!Number.isInteger(years) || years < 0 || years > 60) {
      setError("Enter valid years of experience.");
      return;
    }
    setError(undefined);
    updateProfile({
      name: draft.name.trim(),
      title: draft.title.trim(),
      specialisation: draft.specialisation.trim(),
      yearsExperience: years,
      bio: draft.bio.trim(),
      expertise,
    });
    setSaved(true);
    window.setTimeout(() => setSaved(false), 2500);
  };

  const addExpertise = () => {
    const value = expertiseDraft.trim();
    if (!value || expertise.some((e) => e.toLowerCase() === value.toLowerCase())) return;
    setExpertise((prev) => [...prev, value]);
    setExpertiseDraft("");
  };

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title="Profile"
        lead="Your trainer record — expertise listed here also feeds competency mapping."
      />

      <Card className="flex flex-col gap-5 p-6">
        <div className="flex items-center gap-4">
          <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-primary-soft text-lg font-semibold text-primary">
            {profile.name
              .replace(/^Dr\.\s+|^Prof\.\s+/, "")
              .split(/\s+/)
              .slice(0, 2)
              .map((part) => part[0]?.toUpperCase())
              .join("")}
          </span>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-ink">{profile.name}</p>
            <p className="text-xs text-ink-muted">
              {profile.title} · <span className="font-mono tabular-nums">{profile.id}</span>
            </p>
          </div>
          {saved ? (
            <span role="status" className="ml-auto flex items-center gap-1 text-xs font-medium text-success">
              <CircleCheck size={13} strokeWidth={2} />
              Saved
            </span>
          ) : null}
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Input label="Full name" value={draft.name} onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))} />
          <Input
            label="Designation"
            value={draft.title}
            onChange={(e) => setDraft((d) => ({ ...d, title: e.target.value }))}
          />
          <Input
            label="Specialisation"
            value={draft.specialisation}
            onChange={(e) => setDraft((d) => ({ ...d, specialisation: e.target.value }))}
          />
          <Input
            label="Years of experience"
            type="number"
            min={0}
            value={draft.yearsExperience}
            onChange={(e) => setDraft((d) => ({ ...d, yearsExperience: e.target.value }))}
          />
        </div>

        <Textarea
          label="Professional biography"
          rows={3}
          value={draft.bio}
          placeholder="A short paragraph trainees and administrators will see."
          onChange={(e) => setDraft((d) => ({ ...d, bio: e.target.value }))}
        />

        {/* Expertise */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <GraduationCap size={16} strokeWidth={1.75} className="text-primary" />
            <p className="text-sm font-semibold text-ink">Areas of expertise</p>
          </div>
          {expertise.length > 0 ? (
            <ul className="flex flex-wrap gap-1.5" aria-label="Expertise">
              {expertise.map((area) => (
                <li key={area}>
                  <Badge tone="accent" className="gap-1 py-1 pl-2.5">
                    {area}
                    <button
                      type="button"
                      aria-label={`Remove ${area}`}
                      onClick={() => setExpertise((prev) => prev.filter((e) => e !== area))}
                      className="rounded-full transition-colors hover:text-error"
                    >
                      <X size={12} strokeWidth={2.25} />
                    </button>
                  </Badge>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-xs text-ink-muted">Add subject areas you can teach or consult on.</p>
          )}
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={expertiseDraft}
              placeholder="e.g. Data assimilation"
              aria-label="Add an area of expertise"
              onChange={(event) => setExpertiseDraft(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  addExpertise();
                }
              }}
              className="h-9 w-full rounded-[var(--radius-sm)] border border-border-strong bg-surface px-3 text-sm text-ink placeholder:text-ink-muted focus:border-primary focus:outline-none"
            />
            <Button size="sm" variant="secondary" onClick={addExpertise}>
              <Plus size={14} strokeWidth={2} />
              Add
            </Button>
          </div>
        </div>

        {error ? (
          <p role="alert" className="rounded-[var(--radius-sm)] bg-error-soft px-3 py-2 text-sm font-medium text-error">
            {error}
          </p>
        ) : null}

        <div className="border-t border-border pt-4">
          <Button onClick={save}>Save changes</Button>
        </div>
      </Card>

      <Card className="flex items-start gap-2.5 p-4">
        <UserRound size={15} strokeWidth={1.75} className="mt-0.5 shrink-0 text-info" />
        <p className="text-xs leading-relaxed text-ink-secondary">
          Courses you author list you as the trainer automatically. Competency mapping matches your
          expertise and experience against subject requirements raised by the training division.
        </p>
      </Card>
    </div>
  );
}
