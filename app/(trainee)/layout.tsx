import { AppShell } from "@/components/shell/AppShell";
import { Topbar } from "@/components/shell/Topbar";
import { requireRole } from "@/lib/auth/session";
import { DemoStoreProvider } from "@/lib/store/demo-store";

export default async function TraineeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Server-side role enforcement — wrong role or anonymous users never
  // reach trainee pages, regardless of what the UI shows.
  const user = await requireRole("trainee");

  return (
    <DemoStoreProvider userId={user.id}>
      <AppShell
        topbar={<Topbar user={user} searchHref="/trainee/explore" />}
        navKey="trainee"
      >
        {children}
      </AppShell>
    </DemoStoreProvider>
  );
}
