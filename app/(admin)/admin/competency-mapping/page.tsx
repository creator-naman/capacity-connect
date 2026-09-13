import type { Metadata } from "next";
import { CompetencyMappingView } from "@/components/admin/CompetencyMappingView";

export const metadata: Metadata = { title: "Competency Mapping" };

export default function AdminCompetencyMappingPage() {
  return <CompetencyMappingView />;
}
