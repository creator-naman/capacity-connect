import type { Metadata } from "next";
import { CoursesView } from "@/components/trainer/CoursesView";

export const metadata: Metadata = { title: "My Courses" };

export default async function TrainerCoursesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  return <CoursesView initialQuery={q} />;
}
