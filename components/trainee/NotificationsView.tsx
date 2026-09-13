"use client";

import { useDemoStore } from "@/lib/store/demo-store";
import { NotificationsList } from "@/components/notifications/NotificationsList";

/** Trainee notification centre backed by the trainee demo store. */
export function NotificationsView() {
  const { state, hydrated, markRead, markAllRead } = useDemoStore();
  return (
    <NotificationsList
      notifications={state.notifications}
      hydrated={hydrated}
      markRead={markRead}
      markAllRead={markAllRead}
    />
  );
}
