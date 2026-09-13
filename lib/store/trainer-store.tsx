"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useState,
  type ReactNode,
} from "react";
import type {
  AppNotification,
  Course,
  LibraryItem,
  Questionnaire,
  StoredFileMeta,
  TrainerProfile,
} from "@/lib/types/domain";
import { COURSES } from "@/lib/data/demo/courses";
import { QUESTIONNAIRES, TRAINERS } from "@/lib/data/demo/portal";
import {
  publishCourseToCatalog,
  publishResourceToCatalog,
  unpublishCourseFromCatalog,
  unpublishResourceFromCatalog,
} from "./shared-catalog";

/**
 * DEMO MODE — trainer-side interactive state: owned courses, questionnaires,
 * library items, profile, and notifications. Persists to localStorage per
 * signed-in trainer. The swap to Supabase replaces each api method with a
 * Data-Access-Layer call; pages keep calling the same hooks.
 */

const STORAGE_PREFIX = "cc-trainer-state-v1";

/** Courses authored by the signed-in demo trainer (Dr. Rajesh Iyer). */
const TRAINER_ID = "trh-0201";

export interface TrainerState {
  version: 1;
  courses: Course[];
  questionnaires: Questionnaire[];
  library: LibraryItem[];
  notifications: AppNotification[];
  profile: TrainerProfile;
}

type TrainerAction =
  | { type: "HYDRATE"; state: TrainerState }
  | { type: "CREATE_COURSE"; course: Course; at: string }
  | { type: "UPDATE_COURSE"; courseId: string; patch: Partial<Course> }
  | { type: "CREATE_QUESTIONNAIRE"; questionnaire: Questionnaire; at: string }
  | { type: "ADD_LIBRARY_ITEM"; item: LibraryItem; at: string }
  | { type: "UPDATE_LIBRARY_ITEM_FILE"; itemId: string; file: StoredFileMeta | undefined }
  | { type: "REMOVE_LIBRARY_ITEM"; itemId: string }
  | { type: "UPDATE_PROFILE"; patch: Partial<TrainerProfile> }
  | { type: "MARK_READ"; notificationId: string }
  | { type: "MARK_ALL_READ" }
  | { type: "RESET" };

function makeId(prefix: string): string {
  return `${prefix}-${Math.random().toString(36).slice(2, 8)}`;
}

function pushNotification(
  state: TrainerState,
  notification: Omit<AppNotification, "id" | "read" | "createdAt">,
  at: string
): AppNotification[] {
  return [{ ...notification, id: makeId("ntf"), read: false, createdAt: at }, ...state.notifications];
}

function reducer(state: TrainerState, action: TrainerAction): TrainerState {
  switch (action.type) {
    case "HYDRATE":
      return action.state;

    case "CREATE_COURSE":
      return {
        ...state,
        courses: [action.course, ...state.courses],
        notifications: pushNotification(
          state,
          {
            kind: "content",
            title: action.course.status === "published" ? "Course published" : "Draft saved",
            body: `${action.course.code} — ${action.course.title} is in your course list.`,
            href: `/trainer/courses/${action.course.id}`,
          },
          action.at
        ),
      };

    case "UPDATE_COURSE":
      return {
        ...state,
        courses: state.courses.map((course) =>
          course.id === action.courseId ? { ...course, ...action.patch } : course
        ),
      };

    case "CREATE_QUESTIONNAIRE":
      return {
        ...state,
        questionnaires: [action.questionnaire, ...state.questionnaires],
        notifications: pushNotification(
          state,
          {
            kind: "deadline",
            title: "Questionnaire published",
            body: `${action.questionnaire.title} closes on ${action.questionnaire.deadline}.`,
            href: "/trainer/questionnaires",
          },
          action.at
        ),
      };

    case "ADD_LIBRARY_ITEM":
      return {
        ...state,
        library: [action.item, ...state.library],
      };

    case "UPDATE_LIBRARY_ITEM_FILE":
      return {
        ...state,
        library: state.library.map((item) =>
          item.id === action.itemId ? { ...item, file: action.file } : item
        ),
      };

    case "REMOVE_LIBRARY_ITEM":
      return {
        ...state,
        library: state.library.filter((item) => item.id !== action.itemId),
      };

    case "UPDATE_PROFILE":
      return { ...state, profile: { ...state.profile, ...action.patch } };

    case "MARK_READ":
      return {
        ...state,
        notifications: state.notifications.map((n) =>
          n.id === action.notificationId ? { ...n, read: true } : n
        ),
      };

    case "MARK_ALL_READ":
      return { ...state, notifications: state.notifications.map((n) => ({ ...n, read: true })) };

    case "RESET":
      return seedTrainerState();
  }
}

/** Demo library seeds reuse descriptive resources from the trainer's courses. */
function seedLibrary(): LibraryItem[] {
  return [
    {
      id: "lib-001",
      title: "Lecture: From Richardson to modern NWP",
      kind: "recorded-lecture",
      format: "MP4",
      minutes: 42,
      description: "Induction lecture used across the last eleven NWP batches.",
      addedAt: "2026-06-14",
    },
    {
      id: "lib-002",
      title: "Slide deck: Operational model landscape",
      kind: "presentation",
      format: "PPTX",
      description: "Comparison of global and regional suites for the Indian region.",
      addedAt: "2026-06-20",
    },
    {
      id: "lib-003",
      title: "Worksheet: Bow echo identification drill",
      kind: "study-material",
      format: "PDF",
      description: "Twelve annotated radar loops for the nowcasting case lab.",
      addedAt: "2026-08-02",
    },
  ];
}

function seedTrainerState(): TrainerState {
  const profile = TRAINERS.find((t) => t.id === TRAINER_ID)!;
  const ownCourses = COURSES.filter((course) => course.trainerId === TRAINER_ID);
  return {
    version: 1,
    courses: ownCourses,
    questionnaires: QUESTIONNAIRES,
    library: seedLibrary(),
    notifications: [
      {
        id: "ntf-tr-1",
        kind: "deadline",
        title: "Questionnaire closing in 7 days",
        body: `${QUESTIONNAIRES[1].title} closes on ${QUESTIONNAIRES[1].deadline}. Three cohort responses are in.`,
        createdAt: "2026-09-09T09:00:00",
        read: false,
        href: "/trainer/questionnaires",
      },
      {
        id: "ntf-tr-2",
        kind: "announcement",
        title: "Monsoon 2026 cohort roster finalised",
        body: "Ten trainees are enrolled across your NWP-101 and NOW-102 sections. Participation tracking is live.",
        createdAt: "2026-09-05T14:00:00",
        read: true,
        href: "/trainer/trainees",
      },
    ],
    profile,
  };
}

/* -------------------------------- Context -------------------------------- */

interface TrainerStoreValue {
  state: TrainerState;
  hydrated: boolean;
  userId: string;
  createCourse: (course: Course) => void;
  updateCourse: (courseId: string, patch: Partial<Course>) => void;
  /** Publish a trainer-authored course to the shared trainee catalog. */
  publishCourse: (courseId: string) => void;
  /** Withdraw a published course; attached resources leave the catalog too. */
  unpublishCourse: (courseId: string) => void;
  createQuestionnaire: (questionnaire: Questionnaire) => void;
  addLibraryItem: (item: LibraryItem) => void;
  /** Swap the stored file behind a library item (replace flow). */
  updateLibraryItemFile: (itemId: string, file: StoredFileMeta | undefined) => void;
  /** Attach a library item to a course module and publish it to trainees. */
  publishResource: (itemId: string, courseId: string, moduleId: string) => void;
  /** Withdraw an attached resource from the module and catalog. */
  unpublishResource: (itemId: string) => void;
  removeLibraryItem: (itemId: string) => void;
  updateProfile: (patch: Partial<TrainerProfile>) => void;
  markRead: (notificationId: string) => void;
  markAllRead: () => void;
  resetDemo: () => void;
}

const TrainerStoreContext = createContext<TrainerStoreValue | null>(null);

export function TrainerStoreProvider({
  userId,
  children,
}: {
  userId: string;
  children: ReactNode;
}) {
  const storageKey = `${STORAGE_PREFIX}-${userId}`;
  const [state, dispatch] = useReducer(reducer, undefined, seedTrainerState);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(storageKey);
      if (raw) {
        const parsed = JSON.parse(raw) as TrainerState;
        if (parsed.version === 1 && Array.isArray(parsed.courses)) {
          dispatch({ type: "HYDRATE", state: parsed });
        }
      }
    } catch {
      // corrupted storage — seed state stands
    }
    // One-time client hydration flag; storage reads are impossible during SSR.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setHydrated(true);
  }, [storageKey]);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(storageKey, JSON.stringify(state));
    } catch {
      // storage full or unavailable — demo continues without persistence
    }
  }, [state, hydrated, storageKey]);

  const now = useCallback(() => new Date().toISOString(), []);
  const createCourse = useCallback(
    (course: Course) => {
      dispatch({ type: "CREATE_COURSE", course, at: now() });
      if (course.status === "published") publishCourseToCatalog(course);
    },
    [now]
  );
  const updateCourse = useCallback(
    (courseId: string, patch: Partial<Course>) => {
      dispatch({ type: "UPDATE_COURSE", courseId, patch });
      // Keep an already-published course in sync with its edits.
      const current = state.courses.find((c) => c.id === courseId);
      if (current && current.status === "published") {
        publishCourseToCatalog({ ...current, ...patch });
      }
    },
    [state.courses]
  );
  const publishCourse = useCallback(
    (courseId: string) => {
      const course = state.courses.find((c) => c.id === courseId);
      if (!course) return;
      const published: Course = { ...course, status: "published" };
      dispatch({ type: "UPDATE_COURSE", courseId, patch: { status: "published" } });
      publishCourseToCatalog(published);
    },
    [state.courses]
  );
  const unpublishCourse = useCallback(
    (courseId: string) => {
      dispatch({ type: "UPDATE_COURSE", courseId, patch: { status: "draft" } });
      unpublishCourseFromCatalog(courseId);
    },
    []
  );
  const createQuestionnaire = useCallback(
    (questionnaire: Questionnaire) => dispatch({ type: "CREATE_QUESTIONNAIRE", questionnaire, at: now() }),
    [now]
  );
  const addLibraryItem = useCallback(
    (item: LibraryItem) => dispatch({ type: "ADD_LIBRARY_ITEM", item, at: now() }),
    [now]
  );
  const updateLibraryItemFile = useCallback(
    (itemId: string, file: StoredFileMeta | undefined) =>
      dispatch({ type: "UPDATE_LIBRARY_ITEM_FILE", itemId, file }),
    []
  );
  const publishResource = useCallback(
    (itemId: string, courseId: string, moduleId: string) => {
      const item = state.library.find((i) => i.id === itemId);
      if (!item) return;
      publishResourceToCatalog(item, courseId, moduleId);
    },
    [state.library]
  );
  const unpublishResource = useCallback((itemId: string) => unpublishResourceFromCatalog(itemId), []);
  const removeLibraryItem = useCallback((itemId: string) => dispatch({ type: "REMOVE_LIBRARY_ITEM", itemId }), []);
  const updateProfile = useCallback((patch: Partial<TrainerProfile>) => dispatch({ type: "UPDATE_PROFILE", patch }), []);
  const markRead = useCallback((notificationId: string) => dispatch({ type: "MARK_READ", notificationId }), []);
  const markAllRead = useCallback(() => dispatch({ type: "MARK_ALL_READ" }), []);
  const resetDemo = useCallback(() => dispatch({ type: "RESET" }), []);

  const value = useMemo(
    () => ({
      state,
      hydrated,
      userId,
      createCourse,
      updateCourse,
      publishCourse,
      unpublishCourse,
      createQuestionnaire,
      addLibraryItem,
      updateLibraryItemFile,
      publishResource,
      unpublishResource,
      removeLibraryItem,
      updateProfile,
      markRead,
      markAllRead,
      resetDemo,
    }),
    [state, hydrated, userId, createCourse, updateCourse, publishCourse, unpublishCourse, createQuestionnaire, addLibraryItem, updateLibraryItemFile, publishResource, unpublishResource, removeLibraryItem, updateProfile, markRead, markAllRead, resetDemo]
  );

  return <TrainerStoreContext.Provider value={value}>{children}</TrainerStoreContext.Provider>;
}

export function useTrainerStore(): TrainerStoreValue {
  const ctx = useContext(TrainerStoreContext);
  if (!ctx) throw new Error("useTrainerStore must be used within TrainerStoreProvider");
  return ctx;
}
