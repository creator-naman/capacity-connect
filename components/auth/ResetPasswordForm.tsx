"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { resetPassword } from "@/lib/auth/actions";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { Button, buttonClassName } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

const initial = { error: undefined, success: undefined } as {
  error?: string;
  success?: string;
  pendingClient?: boolean;
};

export function ResetPasswordForm() {
  const [state, formAction, pending] = useActionState(resetPassword, initial);
  // REAL mode: the recovery link's tokens are exchanged by the browser
  // client, so the password update runs here with the user's own session.
  const [clientState, setClientState] = useState<"idle" | "busy" | "done" | "error">("idle");
  const [clientError, setClientError] = useState<string | undefined>();

  const updateSupabasePassword = async (formData: FormData) => {
    const password = String(formData.get("password") ?? "");
    const confirm = String(formData.get("confirm") ?? "");
    if (password.length < 8) {
      setClientError("Password must be at least 8 characters.");
      setClientState("error");
      return;
    }
    if (password !== confirm) {
      setClientError("Passwords do not match.");
      setClientState("error");
      return;
    }
    setClientState("busy");
    const supabase = createSupabaseBrowserClient();
    const { error } = await supabase.auth.updateUser({ password });
    if (error) {
      setClientError(
        "This reset link is invalid or has expired. Request a new one from the sign-in page."
      );
      setClientState("error");
      return;
    }
    setClientState("done");
  };

  const showSuccess = state.success || clientState === "done";
  const showError = state.error ?? (clientState === "error" ? clientError : undefined);
  const busy = pending || clientState === "busy";

  if (showSuccess) {
    return (
      <div className="flex flex-col gap-4">
        <p
          role="status"
          className="rounded-[var(--radius-sm)] bg-success-soft px-3 py-2.5 text-sm text-success"
        >
          {typeof showSuccess === "string"
            ? showSuccess
            : "Your password has been updated. You can now sign in."}
        </p>
        <Link href="/login" className={buttonClassName("primary", "md") + " w-full"}>
          Go to sign in
        </Link>
      </div>
    );
  }

  const handleSubmit = (formData: FormData) => {
    if (isSupabaseConfigured() && state.pendingClient) {
      return updateSupabasePassword(formData);
    }
    return formAction(formData);
  };

  return (
    <form action={handleSubmit} className="flex flex-col gap-4" noValidate>
      {showError ? (
        <p
          role="alert"
          className="rounded-[var(--radius-sm)] bg-error-soft px-3 py-2.5 text-sm font-medium text-error"
        >
          {showError}
        </p>
      ) : null}

      <Input
        label="New password"
        type="password"
        name="password"
        placeholder="At least 8 characters"
        autoComplete="new-password"
        required
      />
      <Input
        label="Confirm new password"
        type="password"
        name="confirm"
        placeholder="Re-enter password"
        autoComplete="new-password"
        required
      />

      <Button type="submit" disabled={busy} className="mt-1 w-full">
        {busy ? "Updating..." : "Update password"}
      </Button>
    </form>
  );
}
