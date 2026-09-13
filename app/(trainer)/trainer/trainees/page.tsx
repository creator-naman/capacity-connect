import type { Metadata } from "next";
import { TraineesView } from "@/components/trainer/TraineesView";

export const metadata: Metadata = { title: "Trainees" };

export default function TrainerTraineesPage() {
  return <TraineesView />;
}
