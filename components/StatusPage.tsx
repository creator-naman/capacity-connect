import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Shared shell for full-page status screens (unauthorized, pending
 * approval, account disabled, 404). Centered, quiet, single primary action.
 */
export function StatusPage({
  icon: Icon,
  tone = "primary",
  title,
  description,
  children,
}: {
  icon: LucideIcon;
  tone?: "primary" | "warning" | "error";
  title: string;
  description: string;
  children?: React.ReactNode;
}) {
  const toneClasses = {
    primary: "bg-primary-soft text-primary",
    warning: "bg-warning-soft text-warning",
    error: "bg-error-soft text-error",
  }[tone];

  return (
    <main className="flex min-h-dvh items-center justify-center px-4 py-12">
      <div className="w-full max-w-md text-center">
        <span
          className={cn(
            "mx-auto flex h-12 w-12 items-center justify-center rounded-[var(--radius-md)]",
            toneClasses
          )}
        >
          <Icon size={24} strokeWidth={1.75} />
        </span>
        <h1 className="mt-5 text-xl font-semibold text-ink">{title}</h1>
        <p className="mt-2 text-sm leading-relaxed text-ink-secondary">{description}</p>
        {children ? (
          <div className="mt-7 flex flex-col items-center justify-center gap-2.5 sm:flex-row">
            {children}
          </div>
        ) : null}
      </div>
    </main>
  );
}
