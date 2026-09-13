import type { Metadata } from "next";
import { DashboardView } from "@/components/trainee/DashboardView";
import { getSession } from "@/lib/auth/session";

export const metadata: Metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const user = await getSession();
  const firstName = user?.name.split(/\s+/)[0] ?? "there";

  return <DashboardView firstName={firstName} />;
}
