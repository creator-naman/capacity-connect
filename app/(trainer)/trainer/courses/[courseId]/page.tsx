import type { Metadata } from "next";
import { CourseManageView } from "@/components/trainer/CourseManageView";

export const metadata: Metadata = { title: "Manage Course" };

export default async function CourseManagePage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const { courseId } = await params;
  return <CourseManageView courseId={courseId} />;
}
