import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { UserDetailView } from "@/components/admin/UserDetailView";
import { listAllAccounts } from "@/lib/auth/registry";
import { COHORT } from "@/lib/data/demo/cohort";
import { TRAINERS } from "@/lib/data/demo/portal";

export const metadata: Metadata = { title: "User" };

export default async function AdminUserDetailPage({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  const { userId } = await params;
  const accounts = listAllAccounts();
  const account = accounts.find((a) => a.id === userId);
  if (!account) notFound();

  const cohortEntry = COHORT.find((t) => t.id === userId);
  const trainerProfile = TRAINERS.find((t) => t.id === userId);

  return (
    <UserDetailView
      account={account}
      cohortEntry={cohortEntry ?? undefined}
      trainerId={trainerProfile?.id}
    />
  );
}
