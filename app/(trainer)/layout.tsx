import { AppShell } from "@/components/shell/AppShell";
import { Topbar } from "@/components/shell/Topbar";
import { requireRole } from "@/lib/auth/session";
import { TrainerStoreProvider } from "@/lib/store/trainer-store";

export default async function TrainerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Server-side role enforcement — wrong role or anonymous users never
  // reach trainer pages, regardless of what the UI shows.
  const user = await requireRole("trainer");

  return (
    <TrainerStoreProvider userId={user.id}>
      <AppShell
        topbar={
          <Topbar
            user={user}
            searchHref="/trainer/courses"
            notificationsHref="/trainer/notifications"
          />
        }
        navKey="trainer"
      >
        {children}
      </AppShell>
    </TrainerStoreProvider>
  );
}
