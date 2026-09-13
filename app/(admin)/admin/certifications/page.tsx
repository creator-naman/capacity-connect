import type { Metadata } from "next";
import { CertificationsView } from "@/components/admin/CertificationsView";

export const metadata: Metadata = { title: "Certifications" };

export default function AdminCertificationsPage() {
  return <CertificationsView />;
}
