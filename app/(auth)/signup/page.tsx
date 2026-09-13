import Link from "next/link";
import type { Metadata } from "next";
import { SignupForm } from "@/components/auth/SignupForm";

export const metadata: Metadata = { title: "Create account" };

export default function SignupPage() {
  return (
    <section className="flex flex-col gap-6">
      <header>
        <h1 className="text-xl font-semibold text-ink">Create your account</h1>
        <p className="mt-1 text-sm text-ink-secondary">
          Register for structured training on the Capacity Connect portal.
        </p>
      </header>

      <SignupForm />

      <p className="text-center text-sm text-ink-secondary">
        Already registered?{" "}
        <Link href="/login" className="font-medium text-primary hover:underline">
          Sign in
        </Link>
      </p>
    </section>
  );
}
