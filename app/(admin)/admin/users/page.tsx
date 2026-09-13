import type { Metadata } from "next";
import { UsersView } from "@/components/admin/UsersView";
import { listAllAccounts } from "@/lib/auth/registry";

export const metadata: Metadata = { title: "Users" };

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const accounts = listAllAccounts();
  const initialStatus =
    status === "pending" || status === "active" || status === "disabled" ? status : undefined;

  return <UsersView accounts={accounts} initialStatus={initialStatus} />;
}
