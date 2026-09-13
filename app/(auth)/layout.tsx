import Link from "next/link";
import { CloudSun } from "lucide-react";
import { requireAnonymous } from "@/lib/auth/session";
import { ThemeToggle } from "@/components/theme/ThemeToggle";

const AUDIENCE = [
  {
    role: "Trainees",
    detail: "Enroll in courses, learn, and earn certifications",
  },
  {
    role: "Trainers",
    detail: "Publish courses, set questionnaires, monitor progress",
  },
  {
    role: "Administrators",
    detail: "Approve accounts, oversee the learning ecosystem",
  },
];

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Signed-in users land straight on their dashboard instead of the forms.
  await requireAnonymous();

  return (
    <div className="flex min-h-dvh">
      <aside className="hidden w-[400px] flex-col justify-between bg-primary px-10 py-10 text-ink-inverted lg:flex xl:w-[440px]">
        <div>
          <Link href="/" className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-[var(--radius-sm)] bg-ink-inverted text-primary">
              <CloudSun size={20} strokeWidth={2} />
            </span>
            <span className="text-base font-semibold">Capacity Connect</span>
          </Link>
          <p className="mt-10 max-w-xs text-2xl font-semibold leading-snug">
            Capacity building for the people who forecast India&apos;s weather.
          </p>
          <p className="mt-3 max-w-xs text-sm leading-relaxed text-ink-inverted/75">
            One portal for structured training, assessment, and certification
            across the India Meteorological Department.
          </p>
        </div>
        <ul className="flex flex-col gap-4">
          {AUDIENCE.map((item) => (
            <li key={item.role} className="border-l-2 border-ink-inverted/25 pl-4">
              <p className="text-sm font-semibold">{item.role}</p>
              <p className="text-sm text-ink-inverted/70">{item.detail}</p>
            </li>
          ))}
        </ul>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-center justify-between p-4 lg:justify-end">
          <Link href="/" className="flex items-center gap-2 lg:hidden">
            <span className="flex h-8 w-8 items-center justify-center rounded-[var(--radius-sm)] bg-primary text-ink-inverted">
              <CloudSun size={18} strokeWidth={2} />
            </span>
            <span className="text-sm font-semibold text-ink">Capacity Connect</span>
          </Link>
          <ThemeToggle />
        </div>
        <main className="flex flex-1 items-start justify-center px-4 pb-10 sm:items-center">
          <div className="w-full max-w-md">{children}</div>
        </main>
        <footer className="pb-6 text-center text-xs text-ink-muted">
          India Meteorological Department · Ministry of Earth Sciences
        </footer>
      </div>
    </div>
  );
}
