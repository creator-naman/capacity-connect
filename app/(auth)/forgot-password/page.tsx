import Link from "next/link";
import type { Metadata } from "next";
import { ForgotPasswordForm } from "@/components/auth/ForgotPasswordForm";

export const metadata: Metadata = { title: "Forgot password" };

export default function ForgotPasswordPage() {
  return (
    <section className="flex flex-col gap-6">
      <header>
        <h1 className="text-xl font-semibold text-ink">Reset your password</h1>
        <p className="mt-1 text-sm text-ink-secondary">
          Enter your official email and we&apos;ll send a reset link.
        </p>
      </header>

      <ForgotPasswordForm />

      <p className="text-center text-sm text-ink-secondary">
        <Link href="/login" className="font-medium text-primary hover:underline">
          ← Back to sign in
        </Link>
      </p>
    </section>
  );
}
