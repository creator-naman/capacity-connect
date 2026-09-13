import type { Metadata } from "next";
import { AssessmentsView } from "@/components/trainee/AssessmentsView";

export const metadata: Metadata = { title: "Assessments" };

export default function AssessmentsPage() {
  return <AssessmentsView />;
}
