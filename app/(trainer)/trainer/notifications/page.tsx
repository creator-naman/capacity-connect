import type { Metadata } from "next";
import { TrainerNotificationsView } from "@/components/trainer/NotificationsView";

export const metadata: Metadata = { title: "Notifications" };

export default function TrainerNotificationsPage() {
  return <TrainerNotificationsView />;
}
