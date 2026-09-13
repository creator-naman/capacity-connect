import type { Metadata } from "next";
import { AdminCoursesView } from "@/components/admin/AdminCoursesView";

export const metadata: Metadata = { title: "Courses" };

export default function AdminCoursesPage() {
  return <AdminCoursesView />;
}
