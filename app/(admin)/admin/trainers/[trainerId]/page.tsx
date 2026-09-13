import type { Metadata } from "next";
import { TrainerDetailView } from "@/components/admin/TrainerViews";

export const metadata: Metadata = { title: "Trainer" };

export default async function AdminTrainerDetailPage({
  params,
}: {
  params: Promise<{ trainerId: string }>;
}) {
  const { trainerId } = await params;
  return <TrainerDetailView trainerId={trainerId} />;
}
