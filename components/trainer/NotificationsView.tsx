"use client";

import { useTrainerStore } from "@/lib/store/trainer-store";
import { NotificationsList } from "@/components/notifications/NotificationsList";

/** Trainer notification centre backed by the trainer demo store. */
export function TrainerNotificationsView() {
  const { state, hydrated, markRead, markAllRead } = useTrainerStore();
  return (
    <NotificationsList
      notifications={state.notifications}
      hydrated={hydrated}
      markRead={markRead}
      markAllRead={markAllRead}
      title="Notifications"
      lead="Cohort activity, questionnaire deadlines, and publishing confirmations."
    />
  );
}
