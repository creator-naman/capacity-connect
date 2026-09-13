"use client";

import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/Button";

/**
 * Route-level error boundary. Never surfaces raw error text — a readable
 * message plus a retry keeps failures recoverable.
 */
export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="flex min-h-dvh items-center justify-center px-4 py-12">
      <div className="w-full max-w-md text-center">
        <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-[var(--radius-md)] bg-error-soft text-error">
          <AlertTriangle size={24} strokeWidth={1.75} />
        </span>
        <h1 className="mt-5 text-xl font-semibold text-ink">Something went wrong</h1>
        <p className="mt-2 text-sm leading-relaxed text-ink-secondary">
          An unexpected error occurred while loading this page. You can try
          again — if the problem persists, contact the training division.
        </p>
        {error.digest ? (
          <p className="mt-3 font-mono text-xs text-ink-muted">Ref: {error.digest}</p>
        ) : null}
        <div className="mt-7 flex justify-center">
          <Button onClick={reset}>Try again</Button>
        </div>
      </div>
    </main>
  );
}
