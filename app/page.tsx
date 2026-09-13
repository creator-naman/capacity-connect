import { redirect } from "next/navigation";
import { getSession, dashboardPath } from "@/lib/auth/session";
import { Homepage } from "@/components/home/Homepage";

/**
 * Signed-in users land straight on their role dashboard; everyone else
 * sees the public homepage.
 */
export default async function RootPage() {
  const user = await getSession();
  if (user && user.status === "active") redirect(dashboardPath(user.role));
  return <Homepage signedIn={Boolean(user)} />;
}
