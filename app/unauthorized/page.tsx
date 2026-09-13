import Link from "next/link";
import type { Metadata } from "next";
import { ShieldAlert } from "lucide-react";
import { StatusPage } from "@/components/StatusPage";
import { SignOutButton } from "@/components/SignOutButton";
import { getSession, dashboardPath } from "@/lib/auth/session";
import { buttonClassName } from "@/components/ui/Button";

export const metadata: Metadata = { title: "Unauthorized" };

export default async function UnauthorizedPage() {
  const user = await getSession();
  const canGoHome = user && user.status === "active";

  return (
    <StatusPage
      icon={ShieldAlert}
      tone="error"
      title="Unauthorized"
      description="Your account does not have permission to view that area of Capacity Connect. If you believe this is a mistake, contact your training administrator."
    >
      {canGoHome ? (
        <Link href={dashboardPath(user.role)} className={buttonClassName()}>
          Go to my dashboard
        </Link>
      ) : null}
      {user ? (
        <SignOutButton label="Sign in with a different account" />
      ) : (
        <Link href="/login" className={buttonClassName()}>
          Go to sign in
        </Link>
      )}
    </StatusPage>
  );
}
