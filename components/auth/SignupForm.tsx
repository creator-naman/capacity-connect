"use client";

import { useActionState } from "react";
import { signUp } from "@/lib/auth/actions";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";

const initial = { error: undefined as string | undefined };

export function SignupForm() {
  const [state, formAction, pending] = useActionState(signUp, initial);

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
        label="Full name"
        name="name"
        placeholder="e.g. Kavya Sharma"
        autoComplete="name"
        required
      />
      <Input
        label="Official email"
        type="email"
        name="email"
        placeholder="name@imd.demo"
        autoComplete="email"
        required
      />
      <Select
        label="I am joining as"
        name="role"
        placeholder="Select a role"
        required
        options={[
          { value: "trainee", label: "Trainee — I am here to learn" },
          { value: "trainer", label: "Trainer — I will conduct training" },
        ]}
        hint="Administrator accounts are provisioned internally, not via signup."
      />
      <Input
        label="Current designation"
        name="title"
        placeholder="e.g. Scientist-B, RMC New Delhi"
        required
      />
      <Input
        label="Password"
        type="password"
        name="password"
        placeholder="At least 8 characters"
        autoComplete="new-password"
        required
      />
      <Input
        label="Confirm password"
        type="password"
        name="confirm"
        placeholder="Re-enter password"
        autoComplete="new-password"
        required
      />

      <Button type="submit" disabled={pending} className="mt-1 w-full">
        {pending ? "Creating account..." : "Create account"}
      </Button>

      <p className="text-center text-xs text-ink-muted">
        New accounts start in <span className="font-medium text-ink-secondary">pending approval</span>{" "}
        until a training administrator reviews them.
      </p>
    </form>
  );
}
