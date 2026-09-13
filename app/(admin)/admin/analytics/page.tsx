import type { Metadata } from "next";
import { AnalyticsView } from "@/components/admin/OversightViews";

export const metadata: Metadata = { title: "Analytics" };

export default function AdminAnalyticsPage() {
  return <AnalyticsView />;
}
