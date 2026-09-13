import type { Metadata } from "next";
import { QuestionnairesView } from "@/components/trainer/QuestionnairesView";

export const metadata: Metadata = { title: "Questionnaires" };

export default function TrainerQuestionnairesPage() {
  return <QuestionnairesView />;
}
