"use client";

import { useActionState } from "react";
import Link from "next/link";
import { demoSignIn, signIn } from "@/lib/auth/actions";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

const initial = { error: undefined as string | undefined };

const DEMO_ROLES = [
  { role: "trainee", label: "Demo Trainee" },
  { role: "trainer", label: "Demo Trainer" },
  { role: "admin", label: "Demo Admin" },
] as const;

export function LoginForm({ next }: { next?: string }) {
  const [state, formAction, pending] = useActionState(signIn, initial);

  return (
    <div className="flex flex-col gap-6">
      <form action={formAction} className="flex flex-col gap-4" noValidate>
        {next ? <input type="hidden" name="next" value={next} /> : null}

        {state.error ? (
          <p
            role="alert"
            className="rounded-[var(--radius-sm)] bg-error-soft px-3 py-2.5 text-sm font-medium text-error"
          >
            {state.error}
          </p>
        ) : null}

        <Input
          label="Official email"
          type="email"
          name="email"
          placeholder="name@imd.demo"
          autoComplete="email"
          required
        />
        <div className="flex flex-col gap-1.5">
          <Input
            label="Password"
            type="password"
            name="password"
            placeholder="••••••••"
            autoComplete="current-password"
            required
          />
          <Link
            href="/forgot-password"
            className="self-end text-xs font-medium text-primary hover:underline"
          >
            Forgot password?
          </Link>
        </div>

        <Button type="submit" disabled={pending} className="mt-1 w-full">
          {pending ? "Signing in..." : "Sign in"}
        </Button>
      </form>

      <div className="relative">
        <div className="absolute inset-x-0 top-1/2 border-t border-border" />
        <p className="relative mx-auto w-fit bg-bg px-3 text-xs font-medium text-ink-muted">
          Demo access — one click, same session flow
        </p>
      </div>

      <form action={demoSignIn} className="grid grid-cols-3 gap-2">
        {DEMO_ROLES.map(({ role, label }) => (
          <Button key={role} variant="secondary" size="sm" type="submit" name="role" value={role}>
            {label}
          </Button>
        ))}
      </form>

      <p className="text-center text-xs text-ink-muted">
        Demo credentials: any listed account with password{" "}
        <code className="font-mono text-ink-secondary">{`demo1234`}</code>
      </p>
    </div>
  );
}
