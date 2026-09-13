import type { Metadata } from "next";
import { TrainerProfileView } from "@/components/trainer/TrainerProfileView";

export const metadata: Metadata = { title: "Profile" };

export default function TrainerProfilePage() {
  return <TrainerProfileView />;
}
