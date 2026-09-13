import type { Metadata } from "next";
import { LibraryView } from "@/components/trainer/LibraryView";

export const metadata: Metadata = { title: "Library" };

export default function TrainerLibraryPage() {
  return <LibraryView />;
}
