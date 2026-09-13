import type { Metadata } from "next";
import { TrainersView } from "@/components/admin/TrainerViews";

export const metadata: Metadata = { title: "Trainers" };

export default function AdminTrainersPage() {
  return <TrainersView />;
}
