import type { Metadata } from "next";
import { ParticipationView } from "@/components/admin/OversightViews";

export const metadata: Metadata = { title: "Participation" };

export default function AdminParticipationPage() {
  return <ParticipationView />;
}
