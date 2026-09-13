"use client";

import type { Course, LibraryItem } from "@/lib/types/domain";

/**
 * DEMO cross-role content bridge.
 *
 * Trainer-published courses and module-attached resources are written here
 * so the trainee side can discover and consume them — the flow the problem
 * statement calls for (trainer publishes → trainee enrolls → trainee learns).
 * One browser-scoped localStorage key shared by the role stores.
 *
 * With Supabase this file disappears: publishes become inserts and the
 * trainee catalog is a query. Views keep calling the same helpers.
 */

export interface PublishedResource extends LibraryItem {
  courseId: string;
  moduleId: string;
  publishedAt: string;
}

/** Admin-published announcement surfaced to trainees and the portal. */
export interface CatalogAnnouncement {
  id: string;
  title: string;
  body: string;
  publishedAt: string;
}

/** Admin-published "new learning content" note surfaced to trainees. */
export interface CatalogContentPost {
  id: string;
  title: string;
  body: string;
  href?: string;
  publishedAt: string;
}

export interface SharedCatalog {
  version: 1;
  courses: Course[];
  resources: PublishedResource[];
  announcements: CatalogAnnouncement[];
  contentPosts: CatalogContentPost[];
}

export const SHARED_CATALOG_KEY = "cc-demo-catalog-v1";

const EMPTY: SharedCatalog = { version: 1, courses: [], resources: [], announcements: [], contentPosts: [] };

export function readSharedCatalog(): SharedCatalog {
  if (typeof window === "undefined") return EMPTY;
  try {
    const raw = window.localStorage.getItem(SHARED_CATALOG_KEY);
    if (!raw) return EMPTY;
    const parsed = JSON.parse(raw) as SharedCatalog;
    if (parsed.version !== 1 || !Array.isArray(parsed.courses) || !Array.isArray(parsed.resources)) {
      return EMPTY;
    }
    return parsed;
  } catch {
    return EMPTY;
  }
}

export function writeSharedCatalog(
  mutate: (catalog: SharedCatalog) => SharedCatalog
): SharedCatalog {
  const next = mutate(readSharedCatalog());
  try {
    window.localStorage.setItem(SHARED_CATALOG_KEY, JSON.stringify(next));
    // Same-tab listeners (trainee store may be mounted in another provider
    // instance); cross-tab sync arrives via the native `storage` event.
    window.dispatchEvent(new CustomEvent("cc-catalog-changed"));
  } catch {
    // storage unavailable — publish still succeeds in-memory for this session
  }
  return next;
}

export function publishCourseToCatalog(course: Course): SharedCatalog {
  return writeSharedCatalog((catalog) => ({
    ...catalog,
    courses: [course, ...catalog.courses.filter((c) => c.id !== course.id)],
  }));
}

export function unpublishCourseFromCatalog(courseId: string): SharedCatalog {
  return writeSharedCatalog((catalog) => ({
    ...catalog,
    courses: catalog.courses.filter((c) => c.id !== courseId),
    // Resources attached to the course leave the catalog with it.
    resources: catalog.resources.filter((r) => r.courseId !== courseId),
  }));
}

export function publishResourceToCatalog(
  item: LibraryItem,
  courseId: string,
  moduleId: string
): SharedCatalog {
  return writeSharedCatalog((catalog) => ({
    ...catalog,
    resources: [
      { ...item, courseId, moduleId, publishedAt: new Date().toISOString().slice(0, 10) },
      ...catalog.resources.filter((r) => r.id !== item.id),
    ],
  }));
}

export function unpublishResourceFromCatalog(itemId: string): SharedCatalog {
  return writeSharedCatalog((catalog) => ({
    ...catalog,
    resources: catalog.resources.filter((r) => r.id !== itemId),
  }));
}

export function publishAnnouncementToCatalog(
  announcement: Omit<CatalogAnnouncement, "id"> & { id?: string }
): SharedCatalog {
  return writeSharedCatalog((catalog) => ({
    ...catalog,
    announcements: [
      { ...announcement, id: announcement.id ?? `ann-${Math.random().toString(36).slice(2, 8)}` },
      ...catalog.announcements,
    ],
  }));
}

export function publishContentPostToCatalog(
  post: Omit<CatalogContentPost, "id"> & { id?: string }
): SharedCatalog {
  return writeSharedCatalog((catalog) => ({
    ...catalog,
    contentPosts: [
      { ...post, id: post.id ?? `cnt-${Math.random().toString(36).slice(2, 8)}` },
      ...catalog.contentPosts,
    ],
  }));
}
