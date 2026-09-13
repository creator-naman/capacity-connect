import type { Metadata } from "next";
import { TrainerDashboardView } from "@/components/trainer/DashboardView";
import { getSession } from "@/lib/auth/session";

export const metadata: Metadata = { title: "Dashboard" };

export default async function TrainerDashboardPage() {
  const user = await getSession();
  const firstName = user?.name.replace(/^Dr\.\s+|^Prof\.\s+/, "").split(/\s+/)[0] ?? "there";

  return <TrainerDashboardView firstName={firstName} />;
}
