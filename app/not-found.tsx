import Link from "next/link";
import type { Metadata } from "next";
import { Compass } from "lucide-react";
import { StatusPage } from "@/components/StatusPage";
import { buttonClassName } from "@/components/ui/Button";

export const metadata: Metadata = { title: "Page not found" };

export default function NotFound() {
  return (
    <StatusPage
      icon={Compass}
      title="Page not found"
      description="The page you are looking for doesn't exist, was moved, or the link is out of date."
    >
      <Link href="/" className={buttonClassName()}>
        Go to homepage
      </Link>
      <Link href="/login" className={buttonClassName("secondary")}>
        Sign in
      </Link>
    </StatusPage>
  );
}
