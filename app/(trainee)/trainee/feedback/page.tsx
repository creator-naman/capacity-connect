import type { Metadata } from "next";
import { FeedbackView } from "@/components/trainee/FeedbackView";

export const metadata: Metadata = { title: "Feedback" };

export default function FeedbackPage() {
  return <FeedbackView />;
}
