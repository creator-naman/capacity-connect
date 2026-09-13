import type { Metadata } from "next";
import { AchievementsView } from "@/components/admin/BroadcastViews";

export const metadata: Metadata = { title: "Achievements" };

export default function AdminAchievementsPage() {
  return <AchievementsView />;
}
