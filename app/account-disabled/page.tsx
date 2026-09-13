import type { Metadata } from "next";
import { Ban } from "lucide-react";
import { StatusPage } from "@/components/StatusPage";
import { SignOutButton } from "@/components/SignOutButton";

export const metadata: Metadata = { title: "Account disabled" };

export default async function AccountDisabledPage() {
  return (
    <StatusPage
      icon={Ban}
      tone="error"
      title="Account disabled"
      description="This account has been disabled by a training administrator and no longer has access to Capacity Connect. Contact the IMD training division if you believe this is an error."
    >
      <SignOutButton />
    </StatusPage>
  );
}
