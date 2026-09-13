"use client";

import { useState } from "react";
import {
  UserRound,
  GraduationCap,
  Briefcase,
  Wrench,
  Heart,
  Plus,
  X,
  CircleCheck,
  Lock,
} from "lucide-react";
import type { ExperienceEntry, Qualification } from "@/lib/types/domain";
import { useDemoStore } from "@/lib/store/demo-store";
import { PageHeader } from "@/components/ui/PageHeader";
import { PageSkeleton } from "@/components/ui/Skeleton";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { formatDate } from "@/lib/format";

/**
 * Professional trainee profile. Personal info saves explicitly; roster-style
 * sections (qualifications, experience, skills, interests) apply immediately
 * so edits feel direct. Email is account identity — not editable here.
 */
export function ProfileView() {
  const { state, hydrated } = useDemoStore();
  if (!hydrated) return <PageSkeleton withStats={false} />;
  return <ProfileSections key={state.profile.email} />;
}

function ProfileSections() {
  const { state, updateProfile } = useDemoStore();
  const profile = state.profile;
  const [savedSection, setSavedSection] = useState<string | null>(null);

  const flashSaved = (section: string) => {
    setSavedSection(section);
    window.setTimeout(() => setSavedSection((current) => (current === section ? null : current)), 2500);
  };

  const isSaved = (section: string) => savedSection === section;

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title="Profile"
        lead="Your professional record as a trainee — kept current, it drives better course recommendations."
      />

      {/* Personal information */}
      <PersonalInfoCard
        profile={profile}
        onSaved={() => {
          flashSaved("personal");
        }}
      >
        <SavedNote show={isSaved("personal")} />
      </PersonalInfoCard>

      {/* Qualifications */}
      <Card className="flex flex-col gap-4 p-5">
        <SectionHeading icon={GraduationCap} title="Qualifications" />
        {profile.qualifications.length === 0 ? (
          <p className="text-xs text-ink-muted">No qualifications added yet.</p>
        ) : (
          <ul className="flex flex-col divide-y divide-[var(--color-border)]">
            {profile.qualifications.map((qualification) => (
              <li key={qualification.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-ink">{qualification.degree}</p>
                  <p className="text-xs text-ink-muted">
                    {qualification.institution} · <span className="font-mono tabular-nums">{qualification.year}</span>
                  </p>
                </div>
                <RemoveButton
                  label={`Remove ${qualification.degree}`}
                  onClick={() => {
                    updateProfile({
                      qualifications: profile.qualifications.filter((q) => q.id !== qualification.id),
                    });
                    flashSaved("qualifications");
                  }}
                />
              </li>
            ))}
          </ul>
        )}
        <AddQualification
          onAdd={(qualification) => {
            updateProfile({ qualifications: [...profile.qualifications, qualification] });
            flashSaved("qualifications");
          }}
        />
      </Card>

      {/* Work experience */}
      <Card className="flex flex-col gap-4 p-5">
        <SectionHeading icon={Briefcase} title="Work experience" />
        {profile.experience.length === 0 ? (
          <p className="text-xs text-ink-muted">No experience added yet.</p>
        ) : (
          <ul className="flex flex-col divide-y divide-[var(--color-border)]">
            {profile.experience.map((entry) => (
              <li key={entry.id} className="flex items-start gap-3 py-3 first:pt-0 last:pb-0">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-ink">{entry.role}</p>
                  <p className="text-xs text-ink-muted">
                    {entry.organisation} · {entry.period}
                  </p>
                  <p className="mt-1 text-xs leading-relaxed text-ink-secondary">{entry.summary}</p>
                </div>
                <RemoveButton
                  label={`Remove ${entry.role}`}
                  onClick={() => {
                    updateProfile({ experience: profile.experience.filter((e) => e.id !== entry.id) });
                    flashSaved("experience");
                  }}
                />
              </li>
            ))}
          </ul>
        )}
        <AddExperience
          onAdd={(entry) => {
            updateProfile({ experience: [...profile.experience, entry] });
            flashSaved("experience");
          }}
        />
      </Card>

      {/* Skills + interests */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="flex flex-col gap-4 p-5">
          <SectionHeading icon={Wrench} title="Skills" />
          <TagEditor
            tags={profile.skills}
            placeholder="e.g. Radar interpretation"
            onAdd={(tag) => {
              updateProfile({ skills: [...profile.skills, tag] });
              flashSaved("skills");
            }}
            onRemove={(tag) => {
              updateProfile({ skills: profile.skills.filter((t) => t !== tag) });
              flashSaved("skills");
            }}
          />
          <SavedNote show={isSaved("skills")} />
        </Card>

        <Card className="flex flex-col gap-4 p-5">
          <SectionHeading icon={Heart} title="Interests" />
          <TagEditor
            tags={profile.interests}
            placeholder="e.g. Cyclone forecasting"
            onAdd={(tag) => {
              updateProfile({ interests: [...profile.interests, tag] });
              flashSaved("interests");
            }}
            onRemove={(tag) => {
              updateProfile({ interests: profile.interests.filter((t) => t !== tag) });
              flashSaved("interests");
            }}
          />
          <SavedNote show={isSaved("interests")} />
        </Card>
      </div>
    </div>
  );
}

/** Transient "Saved" confirmation shown after a section is updated. */
function SavedNote({ show }: { show: boolean }) {
  if (!show) return null;
  return (
    <span role="status" className="flex items-center gap-1 text-xs font-medium text-success">
      <CircleCheck size={13} strokeWidth={2} />
      Saved
    </span>
  );
}

/* --------------------------- personal information -------------------------- */

function PersonalInfoCard({
  profile,
  onSaved,
  children,
}: {
  profile: ReturnType<typeof useDemoStore>["state"]["profile"];
  onSaved: () => void;
  children?: React.ReactNode;
}) {
  const { updateProfile } = useDemoStore();
  const [draft, setDraft] = useState({
    name: profile.name,
    phone: profile.phone,
    designation: profile.designation,
    region: profile.region,
  });
  const [error, setError] = useState<string | undefined>();

  const save = () => {
    if (draft.name.trim().length < 2) {
      setError("Enter your full name.");
      return;
    }
    setError(undefined);
    updateProfile({
      name: draft.name.trim(),
      phone: draft.phone.trim(),
      designation: draft.designation.trim(),
      region: draft.region.trim(),
    });
    onSaved();
  };

  return (
    <Card className="flex flex-col gap-4 p-5">
      <div className="flex items-center justify-between">
        <SectionHeading icon={UserRound} title="Personal information" />
        {children}
      </div>

      <div className="flex items-center gap-4">
        <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-primary-soft text-lg font-semibold text-primary">
          {profile.name
            .split(/\s+/)
            .slice(0, 2)
            .map((part) => part[0]?.toUpperCase())
            .join("")}
        </span>
        <div className="min-w-0">
          <p className="flex items-center gap-1.5 text-sm font-medium text-ink">
            {profile.email}
            <Lock size={12} strokeWidth={1.75} className="text-ink-muted" aria-label="Locked to account" />
          </p>
          <p className="text-xs text-ink-muted">
            Member since {formatDate(profile.joinedOn)} · email is your account identity
          </p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          label="Full name"
          value={draft.name}
          onChange={(event) => setDraft((d) => ({ ...d, name: event.target.value }))}
        />
        <Input
          label="Phone"
          type="tel"
          value={draft.phone}
          placeholder="Add a contact number"
          onChange={(event) => setDraft((d) => ({ ...d, phone: event.target.value }))}
        />
        <Input
          label="Designation"
          value={draft.designation}
          onChange={(event) => setDraft((d) => ({ ...d, designation: event.target.value }))}
        />
        <Input
          label="Region / station"
          value={draft.region}
          placeholder="e.g. RMC New Delhi"
          onChange={(event) => setDraft((d) => ({ ...d, region: event.target.value }))}
        />
      </div>

      {error ? (
        <p role="alert" className="rounded-[var(--radius-sm)] bg-error-soft px-3 py-2 text-sm font-medium text-error">
          {error}
        </p>
      ) : null}

      <div className="flex items-center gap-2">
        <Button size="sm" onClick={save}>
          Save changes
        </Button>
      </div>
    </Card>
  );
}

/* --------------------------------- shared ---------------------------------- */

function SectionHeading({ icon: Icon, title }: { icon: typeof UserRound; title: string }) {
  return (
    <h2 className="flex items-center gap-2 text-sm font-semibold text-ink">
      <Icon size={16} strokeWidth={1.75} className="text-primary" />
      {title}
    </h2>
  );
}

function RemoveButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      className="flex h-7 w-7 shrink-0 items-center justify-center rounded-[var(--radius-sm)] text-ink-muted transition-colors hover:bg-error-soft hover:text-error"
    >
      <X size={14} strokeWidth={2} />
    </button>
  );
}

function AddQualification({ onAdd }: { onAdd: (qualification: Qualification) => void }) {
  const [open, setOpen] = useState(false);
  const [degree, setDegree] = useState("");
  const [institution, setInstitution] = useState("");
  const [year, setYear] = useState("");
  const [error, setError] = useState<string | undefined>();

  if (!open) {
    return (
      <AddToggle label="Add qualification" onClick={() => setOpen(true)} />
    );
  }

  const submit = () => {
    const parsedYear = Number(year);
    if (degree.trim().length < 2 || institution.trim().length < 2) {
      setError("Enter both the degree and institution.");
      return;
    }
    if (!Number.isInteger(parsedYear) || parsedYear < 1970 || parsedYear > 2100) {
      setError("Enter a valid year.");
      return;
    }
    onAdd({
      id: `ql-${Math.random().toString(36).slice(2, 8)}`,
      degree: degree.trim(),
      institution: institution.trim(),
      year: parsedYear,
    });
    setDegree("");
    setInstitution("");
    setYear("");
    setError(undefined);
    setOpen(false);
  };

  return (
    <div className="flex flex-col gap-3 rounded-[var(--radius-sm)] border border-border bg-surface-sunken/60 p-3.5">
      <div className="grid gap-3 sm:grid-cols-3">
        <Input label="Degree" value={degree} placeholder="M.Sc. Atmospheric Science" onChange={(e) => setDegree(e.target.value)} />
        <Input label="Institution" value={institution} placeholder="IITM Pune" onChange={(e) => setInstitution(e.target.value)} />
        <Input label="Year" type="number" value={year} placeholder="2024" onChange={(e) => setYear(e.target.value)} />
      </div>
      {error ? (
        <p role="alert" className="text-xs font-medium text-error">
          {error}
        </p>
      ) : null}
      <div className="flex items-center gap-2">
        <Button size="sm" onClick={submit}>
          <Plus size={14} strokeWidth={2} />
          Add
        </Button>
        <Button size="sm" variant="ghost" onClick={() => setOpen(false)}>
          Cancel
        </Button>
      </div>
    </div>
  );
}

function AddExperience({ onAdd }: { onAdd: (entry: ExperienceEntry) => void }) {
  const [open, setOpen] = useState(false);
  const [role, setRole] = useState("");
  const [organisation, setOrganisation] = useState("");
  const [period, setPeriod] = useState("");
  const [summary, setSummary] = useState("");
  const [error, setError] = useState<string | undefined>();

  if (!open) {
    return <AddToggle label="Add experience" onClick={() => setOpen(true)} />;
  }

  const submit = () => {
    if (role.trim().length < 2 || organisation.trim().length < 2 || period.trim().length < 2) {
      setError("Role, organisation, and period are required.");
      return;
    }
    onAdd({
      id: `xp-${Math.random().toString(36).slice(2, 8)}`,
      role: role.trim(),
      organisation: organisation.trim(),
      period: period.trim(),
      summary: summary.trim(),
    });
    setRole("");
    setOrganisation("");
    setPeriod("");
    setSummary("");
    setError(undefined);
    setOpen(false);
  };

  return (
    <div className="flex flex-col gap-3 rounded-[var(--radius-sm)] border border-border bg-surface-sunken/60 p-3.5">
      <div className="grid gap-3 sm:grid-cols-3">
        <Input label="Role" value={role} placeholder="Observatory Assistant" onChange={(e) => setRole(e.target.value)} />
        <Input label="Organisation" value={organisation} placeholder="IMD Mumbai" onChange={(e) => setOrganisation(e.target.value)} />
        <Input label="Period" value={period} placeholder="2023 – present" onChange={(e) => setPeriod(e.target.value)} />
      </div>
      <Input
        label="Summary"
        value={summary}
        placeholder="Optional — one line on responsibilities"
        onChange={(e) => setSummary(e.target.value)}
      />
      {error ? (
        <p role="alert" className="text-xs font-medium text-error">
          {error}
        </p>
      ) : null}
      <div className="flex items-center gap-2">
        <Button size="sm" onClick={submit}>
          <Plus size={14} strokeWidth={2} />
          Add
        </Button>
        <Button size="sm" variant="ghost" onClick={() => setOpen(false)}>
          Cancel
        </Button>
      </div>
    </div>
  );
}

function TagEditor({
  tags,
  placeholder,
  onAdd,
  onRemove,
}: {
  tags: string[];
  placeholder: string;
  onAdd: (tag: string) => void;
  onRemove: (tag: string) => void;
}) {
  const [value, setValue] = useState("");

  const add = () => {
    const tag = value.trim();
    if (!tag) return;
    if (tags.some((t) => t.toLowerCase() === tag.toLowerCase())) {
      setValue("");
      return;
    }
    onAdd(tag);
    setValue("");
  };

  return (
    <div className="flex flex-col gap-3">
      {tags.length === 0 ? (
        <p className="text-xs text-ink-muted">Nothing added yet.</p>
      ) : (
        <ul className="flex flex-wrap gap-1.5" aria-label="Tags">
          {tags.map((tag) => (
            <li key={tag}>
              <Badge tone="accent" className="gap-1 py-1 pl-2.5">
                {tag}
                <button
                  type="button"
                  aria-label={`Remove ${tag}`}
                  onClick={() => onRemove(tag)}
                  className="rounded-full transition-colors hover:text-error"
                >
                  <X size={12} strokeWidth={2.25} />
                </button>
              </Badge>
            </li>
          ))}
        </ul>
      )}
      <div className="flex items-center gap-2">
        <input
          type="text"
          value={value}
          placeholder={placeholder}
          aria-label="Add a tag"
          onChange={(event) => setValue(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              add();
            }
          }}
          className="h-9 w-full rounded-[var(--radius-sm)] border border-border-strong bg-surface px-3 text-sm text-ink placeholder:text-ink-muted focus:border-primary focus:outline-none"
        />
        <Button size="sm" variant="secondary" onClick={add}>
          <Plus size={14} strokeWidth={2} />
          Add
        </Button>
      </div>
    </div>
  );
}

function AddToggle({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-fit items-center gap-1.5 text-xs font-semibold text-primary hover:underline"
    >
      <Plus size={13} strokeWidth={2} />
      {label}
    </button>
  );
}
