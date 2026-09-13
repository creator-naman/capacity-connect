import type { Metadata } from "next";
import { AnnouncementsView } from "@/components/admin/BroadcastViews";

export const metadata: Metadata = { title: "Announcements" };

export default function AdminAnnouncementsPage() {
  return <AnnouncementsView />;
}
