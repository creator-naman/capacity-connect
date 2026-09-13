"use client";

import { useAdminStore } from "@/lib/store/admin-store";
import { NotificationsList } from "@/components/notifications/NotificationsList";

/** Admin notification centre backed by the admin demo store. */
export function AdminNotificationsView() {
  const { notifications, hydrated, markRead, markAllRead } = useAdminStore();
  return (
    <NotificationsList
      notifications={notifications}
      hydrated={hydrated}
      markRead={markRead}
      markAllRead={markAllRead}
      title="Notifications"
      lead="Approval requests, publishing confirmations, and platform activity."
    />
  );
}
