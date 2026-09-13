import type { Metadata } from "next";
import { ContentView } from "@/components/admin/BroadcastViews";

export const metadata: Metadata = { title: "New Learning Content" };

export default function AdminContentPage() {
  return <ContentView />;
}
