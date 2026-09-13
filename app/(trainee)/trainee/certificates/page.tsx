import type { Metadata } from "next";
import { CertificatesView } from "@/components/trainee/CertificatesView";

export const metadata: Metadata = { title: "Certificates" };

export default function CertificatesPage() {
  return <CertificatesView />;
}
