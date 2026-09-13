import type { Metadata } from "next";
import { CourseDetailView } from "@/components/trainee/CourseDetailView";

export const metadata: Metadata = { title: "Course" };

/**
 * NOTE: no server-side catalog validation here. Trainer-published courses
 * live in the browser-side shared catalog in demo mode, which the server
 * cannot see; the client view renders its own not-found fallback.
 */
export default async function CourseDetailPage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const { courseId } = await params;
  return <CourseDetailView courseId={courseId} />;
}

