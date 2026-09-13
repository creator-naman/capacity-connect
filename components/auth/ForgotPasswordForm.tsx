"use client";

import { useActionState } from "react";
import Link from "next/link";
import { forgotPassword } from "@/lib/auth/actions";
import { Button, buttonClassName } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

const initial = { error: undefined, success: undefined } as {
  error?: string;
  success?: string;
};

export function ForgotPasswordForm() {
  const [state, formAction, pending] = useActionState(forgotPassword, initial);

  if (state.success) {
    return (
      <div className="flex flex-col gap-4">
        <p
          role="status"
          className="rounded-[var(--radius-sm)] bg-success-soft px-3 py-2.5 text-sm text-success"
        >
          {state.success}
        </p>
        <Link href="/reset-password" className={buttonClassName("primary", "md") + " w-full"}>
          Continue to reset password
        </Link>
      </div>
    );
  }

  return (
    <form action={formAction} className="flex flex-col gap-4" noValidate>
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

      <Button type="submit" disabled={pending} className="mt-1 w-full">
        {pending ? "Sending..." : "Send reset link"}
      </Button>
    </form>
  );
}
