import type { Metadata } from "next";
import { PerformanceView } from "@/components/trainer/PerformanceView";

export const metadata: Metadata = { title: "Performance" };

export default function TrainerPerformancePage() {
  return <PerformanceView />;
}
