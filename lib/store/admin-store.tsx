"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { AppNotification } from "@/lib/types/domain";
import {
  readSharedCatalog,
  writeSharedCatalog,
  publishAnnouncementToCatalog,
  publishContentPostToCatalog,
  type CatalogAnnouncement,
  type CatalogContentPost,
} from "./shared-catalog";

/**
 * DEMO MODE — admin-side state. Announcements, achievement spotlights, and
 * new-content notes are published straight into the shared catalog so
 * trainees receive them as notifications. Admin notifications live in
 * localStorage per admin account. Supabase replaces the storage layer.
 */

const STORAGE_PREFIX = "cc-admin-state-v1";

interface AdminState {
  notifications: AppNotification[];
}

const SEED_NOTIFICATIONS: AppNotification[] = [
  {
    id: "ntf-adm-1",
    kind: "system",
    title: "Account awaiting approval",
    body: "Arjun Mehta (Project Scientist) signed up and is pending review.",
    createdAt: "2026-09-08T11:00:00",
    read: false,
    href: "/admin/users",
  },
  {
    id: "ntf-adm-2",
    kind: "content",
    title: "New published course",
    body: "Doppler Radar Meteorology was recently added to the catalog.",
    createdAt: "2026-09-04T10:00:00",
    read: true,
    href: "/admin/courses",
  },
];

interface AdminStoreValue {
  hydrated: boolean;
  userId: string;
  announcements: CatalogAnnouncement[];
  contentPosts: CatalogContentPost[];
  notifications: AppNotification[];
  publishAnnouncement: (title: string, body: string) => void;
  publishContentPost: (title: string, body: string, href?: string) => void;
  featureAchievement: (title: string, description: string) => void;
  markRead: (id: string) => void;
  markAllRead: () => void;
  resetDemo: () => void;
}

const AdminStoreContext = createContext<AdminStoreValue | null>(null);

export function AdminStoreProvider({
  userId,
  children,
}: {
  userId: string;
  children: ReactNode;
}) {
  const storageKey = `${STORAGE_PREFIX}-${userId}`;
  const [notifications, setNotifications] = useState<AppNotification[]>(SEED_NOTIFICATIONS);
  const [announcements, setAnnouncements] = useState<CatalogAnnouncement[]>([]);
  const [contentPosts, setContentPosts] = useState<CatalogContentPost[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(storageKey);
      if (raw) {
        const parsed = JSON.parse(raw) as AdminState;
        // One-time client hydration; storage reads are impossible during SSR.
        // eslint-disable-next-line react-hooks/set-state-in-effect
        if (Array.isArray(parsed.notifications)) setNotifications(parsed.notifications);
      }
    } catch {
      // corrupted storage — seed stands
    }
    setHydrated(true);
  }, [storageKey]);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(storageKey, JSON.stringify({ notifications }));
    } catch {
      // storage unavailable — demo continues without persistence
    }
  }, [notifications, hydrated, storageKey]);

  // Mirror the shared catalog (announcements/content posts) live.
  useEffect(() => {
    const refresh = () => {
      const shared = readSharedCatalog();
      setAnnouncements(shared.announcements);
      setContentPosts(shared.contentPosts);
    };
    refresh();
    window.addEventListener("cc-catalog-changed", refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener("cc-catalog-changed", refresh);
      window.removeEventListener("storage", refresh);
    };
  }, []);

  const notify = useCallback((notification: Omit<AppNotification, "id" | "read" | "createdAt">) => {
    setNotifications((prev) => [
      { ...notification, id: `ntf-${Math.random().toString(36).slice(2, 8)}`, read: false, createdAt: new Date().toISOString() },
      ...prev,
    ]);
  }, []);

  const publishAnnouncement = useCallback(
    (title: string, body: string) => {
      publishAnnouncementToCatalog({ title, body, publishedAt: new Date().toISOString().slice(0, 10) });
      notify({ kind: "announcement", title: "Announcement published", body: title, href: "/admin/announcements" });
    },
    [notify]
  );

  const publishContentPost = useCallback(
    (title: string, body: string, href?: string) => {
      publishContentPostToCatalog({ title, body, href, publishedAt: new Date().toISOString().slice(0, 10) });
      notify({ kind: "content", title: "Content note published", body: title, href: "/admin/content" });
    },
    [notify]
  );

  const featureAchievement = useCallback(
    (title: string, description: string) => {
      publishAnnouncementToCatalog({
        title: `Achievement spotlight — ${title}`,
        body: description,
        publishedAt: new Date().toISOString().slice(0, 10),
      });
      notify({ kind: "achievement", title: "Achievement spotlighted", body: title, href: "/admin/achievements" });
    },
    [notify]
  );

  const markRead = useCallback(
    (id: string) => setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n))),
    []
  );
  const markAllRead = useCallback(
    () => setNotifications((prev) => prev.map((n) => ({ ...n, read: true }))),
    []
  );
  const resetDemo = useCallback(() => {
    setNotifications(SEED_NOTIFICATIONS);
    writeSharedCatalog((catalog) => ({ ...catalog, announcements: [], contentPosts: [] }));
  }, []);

  const value = useMemo(
    () => ({
      hydrated,
      userId,
      announcements,
      contentPosts,
      notifications,
      publishAnnouncement,
      publishContentPost,
      featureAchievement,
      markRead,
      markAllRead,
      resetDemo,
    }),
    [hydrated, userId, announcements, contentPosts, notifications, publishAnnouncement, publishContentPost, featureAchievement, markRead, markAllRead, resetDemo]
  );

  return <AdminStoreContext.Provider value={value}>{children}</AdminStoreContext.Provider>;
}

export function useAdminStore(): AdminStoreValue {
  const ctx = useContext(AdminStoreContext);
  if (!ctx) throw new Error("useAdminStore must be used within AdminStoreProvider");
  return ctx;
}
