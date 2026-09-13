import type { Metadata } from "next";
import { QuestionnaireCreateForm } from "@/components/trainer/QuestionnaireCreateForm";
import { getSession } from "@/lib/auth/session";

export const metadata: Metadata = { title: "Create Questionnaire" };

export default async function QuestionnaireCreatePage() {
  const user = await getSession();
  return <QuestionnaireCreateForm trainerName={user?.name ?? "Trainer"} />;
}
