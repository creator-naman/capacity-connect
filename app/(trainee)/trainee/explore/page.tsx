import type { Metadata } from "next";
import { ExploreView } from "@/components/trainee/ExploreView";

export const metadata: Metadata = { title: "Explore Courses" };

export default async function ExplorePage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  return <ExploreView initialQuery={q} />;
}
