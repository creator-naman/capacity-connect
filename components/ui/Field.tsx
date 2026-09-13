import { useId, type ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Shared shell for form controls: accessible label/hint/error wiring.
 * Input, Select and Textarea compose this so validation messaging and
 * focus states stay identical across every form in the product.
 */
export function Field({
  label,
  hint,
  error,
  required,
  children,
  className,
}: {
  label: string;
  hint?: string;
  error?: string;
  required?: boolean;
  children: (ids: { id: string; describedBy: string | undefined; invalid: boolean }) => ReactNode;
  className?: string;
}) {
  const generatedId = useId();
  const hintId = `${generatedId}-hint`;
  const errorId = `${generatedId}-error`;
  const describedBy = [hint ? hintId : null, error ? errorId : null]
    .filter(Boolean)
    .join(" ") || undefined;

  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <label htmlFor={generatedId} className="text-sm font-medium text-ink">
        {label}
        {required ? (
          <span className="ml-0.5 text-error" aria-hidden="true">
            *
          </span>
        ) : (
          <span className="ml-1.5 text-xs font-normal text-ink-muted">Optional</span>
        )}
      </label>
      {children({ id: generatedId, describedBy, invalid: Boolean(error) })}
      {hint && !error ? (
        <p id={hintId} className="text-xs text-ink-muted">
          {hint}
        </p>
      ) : null}
      {error ? (
        <p id={errorId} role="alert" className="text-xs font-medium text-error">
          {error}
        </p>
      ) : null}
    </div>
  );
}

/** Shared control styling — border/ghost states re-tune per theme via tokens. */
export const controlClassName = (invalid: boolean) =>
  cn(
    "w-full rounded-[var(--radius-sm)] border bg-surface px-3 text-sm text-ink",
    "placeholder:text-ink-muted transition-colors duration-150",
    "focus:border-primary focus:outline-none",
    "disabled:cursor-not-allowed disabled:opacity-50",
    invalid
      ? "border-error focus:border-error"
      : "border-border-strong hover:border-ink-muted"
  );
