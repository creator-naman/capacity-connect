import { AppShell } from "@/components/shell/AppShell";
import { Topbar } from "@/components/shell/Topbar";
import { requireRole } from "@/lib/auth/session";
import { AdminStoreProvider } from "@/lib/store/admin-store";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Server-side role enforcement — wrong role or anonymous users never
  // reach admin pages, regardless of what the UI shows.
  const user = await requireRole("admin");

  return (
    <AdminStoreProvider userId={user.id}>
      <AppShell
        topbar={
          <Topbar
            user={user}
            searchHref="/admin/users"
            notificationsHref="/admin/notifications"
          />
        }
        navKey="admin"
      >
        {children}
      </AppShell>
    </AdminStoreProvider>
  );
}
