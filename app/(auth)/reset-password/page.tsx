import Link from "next/link";
import type { Metadata } from "next";
import { ResetPasswordForm } from "@/components/auth/ResetPasswordForm";

export const metadata: Metadata = { title: "Reset password" };

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  await searchParams; // demo mode: the token is acknowledged but not verified

  return (
    <section className="flex flex-col gap-6">
      <header>
        <h1 className="text-xl font-semibold text-ink">Choose a new password</h1>
        <p className="mt-1 text-sm text-ink-secondary">
          Set a new password of at least 8 characters.
        </p>
      </header>

      <ResetPasswordForm />

      <p className="text-center text-sm text-ink-secondary">
        <Link href="/login" className="font-medium text-primary hover:underline">
          ← Back to sign in
        </Link>
      </p>
    </section>
  );
}
