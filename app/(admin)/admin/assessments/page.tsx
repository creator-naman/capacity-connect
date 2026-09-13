import type { Metadata } from "next";
import { AssessmentsAdminView } from "@/components/admin/AssessmentsAdminView";

export const metadata: Metadata = { title: "Assessments" };

export default function AdminAssessmentsPage() {
  return <AssessmentsAdminView />;
}
