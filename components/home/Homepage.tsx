import Link from "next/link";
import {
  CloudSun,
  BookOpen,
  ClipboardCheck,
  Award,
  Presentation,
  MonitorPlay,
  FileText,
  UserRound,
  Users,
  ShieldCheck,
  Route,
  Bell,
  Target,
  ArrowRight,
  CircleCheck,
} from "lucide-react";
import { buttonClassName } from "@/components/ui/Button";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

/**
 * Public marketing page. Deliberately factual: it explains what the portal
 * does and who it serves without inventing statistics or testimonials.
 */
export function Homepage({ signedIn }: { signedIn: boolean }) {
  return (
    <div className="min-h-dvh">
      <SiteHeader signedIn={signedIn} />

      <main>
        <Hero signedIn={signedIn} />
        <RoleSection />
        <EcosystemSection />
        <CompetencySection />
        <OperationsSection />
        <ClosingCta signedIn={signedIn} />
      </main>

      <footer className="border-t border-border">
        <div className="mx-auto flex max-w-5xl flex-col gap-2 px-4 py-8 text-xs text-ink-muted sm:flex-row sm:items-center sm:justify-between">
          <p>Capacity Connect — a learning management portal for the India Meteorological Department.</p>
          <p>
            Ministry of Earth Sciences · Smart India Hackathon 2026 · SIH 26075
          </p>
        </div>
      </footer>
    </div>
  );
}

function SiteHeader({ signedIn }: { signedIn: boolean }) {
  return (
    <header className="sticky top-0 z-30 border-b border-border bg-[var(--color-surface-glass)] backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-5xl items-center gap-3 px-4">
        <Link href="/" className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-[var(--radius-sm)] bg-primary text-ink-inverted">
            <CloudSun size={18} strokeWidth={2} />
          </span>
          <span className="text-sm font-semibold text-ink">Capacity Connect</span>
        </Link>
        <nav aria-label="Sections" className="ml-6 hidden items-center gap-5 text-sm text-ink-secondary md:flex">
          <a href="#roles" className="transition-colors hover:text-ink">Roles</a>
          <a href="#ecosystem" className="transition-colors hover:text-ink">Learning flow</a>
          <a href="#competency" className="transition-colors hover:text-ink">Competency mapping</a>
          <a href="#operations" className="transition-colors hover:text-ink">Administration</a>
        </nav>
        <div className="ml-auto flex items-center gap-2">
          <ThemeToggle />
          {signedIn ? (
            <Link href="/login" className={buttonClassName("primary", "sm")}>
              Continue
            </Link>
          ) : (
            <>
              <Link href="/login" className={buttonClassName("ghost", "sm")}>
                Sign in
              </Link>
              <Link href="/signup" className={buttonClassName("primary", "sm")}>
                Sign up
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

function Hero({ signedIn }: { signedIn: boolean }) {
  return (
    <section className="mx-auto max-w-5xl px-4 pb-16 pt-14 sm:pt-20">
      <div className="grid items-center gap-10 lg:grid-cols-[1.1fr_0.9fr]">
        <div>
          <Badge tone="accent" className="mb-4">
            IMD Training Division · MoES
          </Badge>
          <h1 className="text-3xl font-semibold leading-tight tracking-tight text-ink sm:text-4xl">
            Structured capacity building for India&apos;s meteorological workforce.
          </h1>
          <p className="mt-4 max-w-xl text-base leading-relaxed text-ink-secondary">
            Capacity Connect is a single, secure portal where trainees learn,
            trainers teach and monitor progress, and administrators oversee the
            entire learning ecosystem — courses, assessments, certifications,
            and the people behind them.
          </p>
          <div className="mt-7 flex flex-col gap-2.5 sm:flex-row">
            <Link href="/signup" className={buttonClassName("primary", "md")}>
              Create an account
              <ArrowRight size={16} strokeWidth={2} />
            </Link>
            <Link href={signedIn ? "/login" : "/login?next=%2F"} className={buttonClassName("secondary", "md")}>
              {signedIn ? "Continue to portal" : "Sign in to the portal"}
            </Link>
          </div>
          <p className="mt-4 text-xs text-ink-muted">
            Role-based access · Trainee, trainer, and administrator workspaces · Responsive and accessible
          </p>
        </div>

        <HeroPanel />
      </div>
    </section>
  );
}

/* A quiet, factual preview of the portal's structure — real feature
   names, no invented numbers or screenshots. */
function HeroPanel() {
  const glimpse = [
    { icon: BookOpen, label: "Courses & modules", note: "Structured, self-paced learning paths" },
    { icon: MonitorPlay, label: "Recorded lectures", note: "Revisit sessions on your schedule" },
    { icon: ClipboardCheck, label: "Subject-wise MCQs", note: "Assessments with instant results" },
    { icon: Award, label: "Certification", note: "Certificates on course completion" },
  ];

  return (
    <Card className="overflow-hidden">
      <div className="border-b border-border bg-surface-sunken px-4 py-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-ink-muted">
          Inside the portal
        </p>
      </div>
      <ul className="flex flex-col divide-y divide-[var(--color-border)]">
        {glimpse.map(({ icon: Icon, label, note }) => (
          <li key={label} className="flex items-center gap-3 px-4 py-3.5">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[var(--radius-sm)] bg-accent-soft text-accent">
              <Icon size={18} strokeWidth={1.75} />
            </span>
            <div className="min-w-0">
              <p className="text-sm font-medium text-ink">{label}</p>
              <p className="truncate text-xs text-ink-muted">{note}</p>
            </div>
          </li>
        ))}
      </ul>
    </Card>
  );
}

const ROLES = [
  {
    icon: UserRound,
    title: "Trainees",
    points: [
      "Build a professional profile with qualifications, experience, skills, and interests",
      "Enroll in courses and work through modules, recorded lectures, and study material",
      "Take subject-wise MCQ assessments and earn certificates on completion",
      "Share feedback on course relevance and training quality",
    ],
  },
  {
    icon: Users,
    title: "Trainers",
    points: [
      "Create and manage courses with modules and learning resources",
      "Maintain a library of presentations, recordings, and study material",
      "Run questionnaires with deadlines and review responses",
      "Monitor trainee participation and performance across cohorts",
    ],
  },
  {
    icon: ShieldCheck,
    title: "Administrators",
    points: [
      "Approve new accounts and manage roles across the organization",
      "Oversee courses, enrollments, assessments, and certifications",
      "Publish announcements and recognise trainee achievements",
      "Map competencies to identify suitable trainers for a subject",
    ],
  },
];

function RoleSection() {
  return (
    <section id="roles" className="border-t border-border bg-surface-sunken/60">
      <div className="mx-auto max-w-5xl px-4 py-16">
        <SectionHeading
          title="One portal, three purposeful workspaces"
          lead="Everyone signs in through the same door; the portal routes each role to the tools and oversight it needs."
        />
        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {ROLES.map(({ icon: Icon, title, points }) => (
            <Card key={title} className="flex flex-col p-5">
              <span className="flex h-10 w-10 items-center justify-center rounded-[var(--radius-sm)] bg-primary-soft text-primary">
                <Icon size={20} strokeWidth={1.75} />
              </span>
              <h3 className="mt-4 text-base font-semibold text-ink">{title}</h3>
              <ul className="mt-3 flex flex-col gap-2.5">
                {points.map((point) => (
                  <li key={point} className="flex gap-2 text-sm leading-snug text-ink-secondary">
                    <CircleCheck size={15} strokeWidth={1.75} className="mt-0.5 shrink-0 text-accent" />
                    {point}
                  </li>
                ))}
              </ul>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

const FLOW = [
  {
    step: "01",
    icon: BookOpen,
    title: "Explore & enroll",
    text: "Browse the course catalog, review modules and prerequisites, and enroll.",
  },
  {
    step: "02",
    icon: Presentation,
    title: "Learn",
    text: "Work through modules with recorded lectures, presentations, and study material.",
  },
  {
    step: "03",
    icon: ClipboardCheck,
    title: "Assess",
    text: "Take subject-wise MCQ assessments and see results immediately.",
  },
  {
    step: "04",
    icon: Award,
    title: "Certify",
    text: "Complete a course to earn a certificate recorded on your profile.",
  },
];

function EcosystemSection() {
  return (
    <section id="ecosystem" className="border-t border-border">
      <div className="mx-auto max-w-5xl px-4 py-16">
        <SectionHeading
          title="A learning flow that actually completes"
          lead="From discovery to certification, every stage connects — so progress is visible to the trainee, the trainer, and the administrator."
        />
        <ol className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {FLOW.map(({ step, icon: Icon, title, text }) => (
            <li key={step}>
              <Card className="flex h-full flex-col p-5">
                <div className="flex items-center justify-between">
                  <span className="flex h-9 w-9 items-center justify-center rounded-[var(--radius-sm)] bg-accent-soft text-accent">
                    <Icon size={18} strokeWidth={1.75} />
                  </span>
                  <span className="font-mono text-xs text-ink-muted">{step}</span>
                </div>
                <h3 className="mt-4 text-sm font-semibold text-ink">{title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-ink-secondary">{text}</p>
              </Card>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

function CompetencySection() {
  return (
    <section id="competency" className="border-t border-border bg-surface-sunken/60">
      <div className="mx-auto grid max-w-5xl items-start gap-10 px-4 py-16 lg:grid-cols-[1fr_1fr]">
        <div>
          <SectionHeading
            align="start"
            title="Competency mapping, in the open"
            lead="When a subject needs a trainer, administrators don't guess. The portal matches candidate trainers against the required competency and shows the factors behind every match."
          />
          <ul className="mt-6 flex flex-col gap-3">
            {[
              "Declared expertise and skills overlap with the subject's competency requirements",
              "Trainer experience, including prior courses conducted on related topics",
              "Availability and current training load",
            ].map((item) => (
              <li key={item} className="flex gap-2.5 text-sm text-ink-secondary">
                <Target size={16} strokeWidth={1.75} className="mt-0.5 shrink-0 text-primary" />
                {item}
              </li>
            ))}
          </ul>
        </div>
        <Card className="p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-ink-muted">
            How a match is presented
          </p>
          <div className="mt-4 flex flex-col gap-3">
            <MatchRow label="Subject" value="Numerical Weather Prediction — data assimilation" />
            <MatchRow label="Required competency" value="NWP model interpretation · geospatial data handling" />
            <MatchRow label="Candidate trainers" value="Ranked by transparent, explainable factors" muted />
            <MatchRow label="Suitability" value="Breakdown shown per factor — no black box" muted />
          </div>
          <p className="mt-5 border-t border-border pt-4 text-xs leading-relaxed text-ink-muted">
            Suitability scoring is explainable by design: each contributing
            factor is visible, so the choice of a trainer can be justified to
            the division.
          </p>
        </Card>
      </div>
    </section>
  );
}

function MatchRow({
  label,
  value,
  muted,
}: {
  label: string;
  value: string;
  muted?: boolean;
}) {
  return (
    <div className="rounded-[var(--radius-sm)] border border-border bg-surface px-3.5 py-3">
      <p className="text-xs font-medium text-ink-muted">{label}</p>
      <p className={muted ? "mt-0.5 text-sm text-ink-secondary" : "mt-0.5 text-sm font-medium text-ink"}>
        {value}
      </p>
    </div>
  );
}

const OPERATIONS = [
  {
    icon: ShieldCheck,
    title: "Approval & roles",
    text: "New signups wait in a pending state until an administrator reviews and approves them. Roles are granted deliberately — trainee, trainer, or administrator.",
  },
  {
    icon: Route,
    title: "Monitoring",
    text: "Course activity, enrollments, assessment outcomes, certification counts, and participation statistics stay visible to administrators.",
  },
  {
    icon: Bell,
    title: "Announcements & achievements",
    text: "Publish announcements, highlight newly added learning content, and recognise trainee achievements across the portal.",
  },
  {
    icon: FileText,
    title: "Questionnaires",
    text: "Trainers collect structured input from trainees through questionnaires with firm deadlines — feedback that shapes the next cohort.",
  },
];

function OperationsSection() {
  return (
    <section id="operations" className="border-t border-border">
      <div className="mx-auto max-w-5xl px-4 py-16">
        <SectionHeading
          title="Administration with real oversight"
          lead="The learning ecosystem stays healthy when someone can see all of it. Administrators get exactly that view."
        />
        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          {OPERATIONS.map(({ icon: Icon, title, text }) => (
            <Card key={title} className="flex gap-4 p-5">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[var(--radius-sm)] bg-primary-soft text-primary">
                <Icon size={20} strokeWidth={1.75} />
              </span>
              <div>
                <h3 className="text-sm font-semibold text-ink">{title}</h3>
                <p className="mt-1 text-sm leading-relaxed text-ink-secondary">{text}</p>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

function ClosingCta({ signedIn }: { signedIn: boolean }) {
  return (
    <section className="border-t border-border bg-primary text-ink-inverted">
      <div className="mx-auto flex max-w-5xl flex-col items-start gap-6 px-4 py-14 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold sm:text-2xl">
            Ready to build capability that compounds?
          </h2>
          <p className="mt-2 max-w-lg text-sm leading-relaxed text-ink-inverted/75">
            Sign up as a trainee or trainer, or explore the portal with a demo
            account on the sign-in screen.
          </p>
        </div>
        <div className="flex shrink-0 flex-col gap-2.5 sm:flex-row">
          <Link
            href="/signup"
            className={buttonClassName("secondary", "md") + " border-transparent bg-transparent text-ink-inverted hover:bg-ink-inverted/10"}
          >
            Create an account
          </Link>
          <Link
            href="/login"
            className={
              buttonClassName("primary", "md") +
              " bg-ink-inverted text-primary hover:bg-ink-inverted/90"
            }
          >
            {signedIn ? "Continue to portal" : "Sign in"}
          </Link>
        </div>
      </div>
    </section>
  );
}

function SectionHeading({
  title,
  lead,
  align = "center",
}: {
  title: string;
  lead: string;
  align?: "center" | "start";
}) {
  return (
    <div className={align === "center" ? "mx-auto max-w-2xl text-center" : "max-w-xl"}>
      <h2 className="text-2xl font-semibold tracking-tight text-ink">{title}</h2>
      <p
        className={
          "mt-3 text-sm leading-relaxed text-ink-secondary " +
          (align === "center" ? "mx-auto max-w-xl" : "")
        }
      >
        {lead}
      </p>
    </div>
  );
}
