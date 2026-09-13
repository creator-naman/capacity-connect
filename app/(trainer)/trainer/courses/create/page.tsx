import type { Metadata } from "next";
import { CourseCreateForm } from "@/components/trainer/CourseCreateForm";
import { getSession } from "@/lib/auth/session";

export const metadata: Metadata = { title: "Create Course" };

export default async function CourseCreatePage() {
  const user = await getSession();
  return <CourseCreateForm trainerName={user?.name ?? "Trainer"} />;
}
