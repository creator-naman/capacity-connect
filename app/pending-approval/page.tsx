import type { Metadata } from "next";
import { Hourglass } from "lucide-react";
import { StatusPage } from "@/components/StatusPage";
import { SignOutButton } from "@/components/SignOutButton";
import { getSession } from "@/lib/auth/session";

export const metadata: Metadata = { title: "Pending approval" };

export default async function PendingApprovalPage() {
  const user = await getSession();

  return (
    <StatusPage
      icon={Hourglass}
      tone="warning"
      title="Account pending approval"
      description="Your registration has been recorded and is awaiting review by a training administrator. You will be able to sign in and start learning once your account is approved."
    >
      {user?.email ? (
        <p className="text-xs text-ink-muted">
          Registered as <span className="font-mono">{user.email}</span>
        </p>
      ) : null}
      <SignOutButton />
    </StatusPage>
  );
}
