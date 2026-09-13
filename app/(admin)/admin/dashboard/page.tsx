import type { Metadata } from "next";
import { AdminDashboardView } from "@/components/admin/AdminDashboardView";
import { getSession } from "@/lib/auth/session";
import { listAllAccounts } from "@/lib/auth/registry";

export const metadata: Metadata = { title: "Dashboard" };

export default async function AdminDashboardPage() {
  const user = await getSession();
  const accounts = listAllAccounts();
  const firstName = user?.name.split(/\s+/)[0] ?? "there";

  return <AdminDashboardView firstName={firstName} accounts={accounts} />;
}
