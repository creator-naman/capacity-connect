import type { Metadata } from "next";
import { AdminNotificationsView } from "@/components/admin/AdminNotificationsView";

export const metadata: Metadata = { title: "Notifications" };

export default function AdminNotificationsPage() {
  return <AdminNotificationsView />;
}
