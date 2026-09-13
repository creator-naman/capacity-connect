import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AssessmentRunner } from "@/components/trainee/AssessmentRunner";
import { getAssessment } from "@/lib/data/demo/assessments";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ assessmentId: string }>;
}): Promise<Metadata> {
  const { assessmentId } = await params;
  const assessment = getAssessment(assessmentId);
  return { title: assessment ? assessment.title : "Assessment" };
}

export default async function AssessmentPage({
  params,
}: {
  params: Promise<{ assessmentId: string }>;
}) {
  const { assessmentId } = await params;
  if (!getAssessment(assessmentId)) notFound();
  return <AssessmentRunner assessmentId={assessmentId} />;
}
