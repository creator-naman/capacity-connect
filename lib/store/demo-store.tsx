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
  Achievement,
  Activity,
  ActivityKind,
  AppNotification,
  Certificate,
  Course,
  CourseFeedback,
  Enrollment,
  QuestionnaireResponse,
  QuizResult,
  TraineeProfile,
} from "@/lib/types/domain";
import { ASSESSMENTS } from "@/lib/data/demo/assessments";
import { COURSES, getCourse } from "@/lib/data/demo/courses";
import {
  ACHIEVEMENTS,
  ANNOUNCEMENTS,
  QUESTIONNAIRES,
  TRAINEE_PROFILE,
} from "@/lib/data/demo/portal";
import {
  readSharedCatalog,
  type CatalogAnnouncement,
  type CatalogContentPost,
  type PublishedResource,
  type SharedCatalog,
} from "./shared-catalog";

/**
 * DEMO MODE — trainee-side interactive state.
 *
 * This store makes the demo's workflows real on the frontend: enrollments,
 * module progress, quiz attempts, certificate issuance, feedback, and
 * notification read-state all mutate here and persist to localStorage per
 * signed-in user. When Supabase lands, each api method below becomes a
 * Data-Access-Layer call and the provider disappears; pages keep calling
 * the same hooks.
 */

const STORAGE_PREFIX = "cc-demo-state-v1";

export interface DemoState {
  version: 1;
  enrollments: Enrollment[];
  quizResults: QuizResult[];
  certificates: Certificate[];
  feedback: CourseFeedback[];
  questionnaireResponses: QuestionnaireResponse[];
  notifications: AppNotification[];
  achievements: Achievement[];
  activity: Activity[];
  profile: TraineeProfile;
  /** Admin announcements / content posts already turned into notifications. */
  seenAnnouncementIds: string[];
}

type DemoAction =
  | { type: "HYDRATE"; state: DemoState }
  | { type: "ENROLL"; courseId: string; at: string; catalogCourses?: Course[] }
  | { type: "COMPLETE_MODULE"; courseId: string; moduleId: string; at: string; catalogCourses?: Course[] }
  | { type: "SUBMIT_QUIZ"; assessmentId: string; answers: Record<string, number>; at: string; catalogCourses?: Course[] }
  | { type: "SUBMIT_FEEDBACK"; courseId: string; rating: number; relevanceComment: string; trainerComment: string; at: string; catalogCourses?: Course[] }
  | { type: "SUBMIT_QUESTIONNAIRE"; questionnaireId: string; answers: Record<string, string>; at: string }
  | { type: "UPDATE_PROFILE"; patch: Partial<TraineeProfile> }
  | { type: "MARK_READ"; notificationId: string }
  | { type: "MARK_ALL_READ" }
  | { type: "MERGE_CATALOG"; announcements: CatalogAnnouncement[]; contentPosts: CatalogContentPost[] }
  | { type: "RESET"; at: string };

/** Static curated catalog first, then trainer-published courses. */
function resolveCourse(id: string, catalogCourses: Course[] | undefined) {
  return getCourse(id) ?? catalogCourses?.find((course) => course.id === id);
}

function makeId(prefix: string): string {
  return `${prefix}-${Math.random().toString(36).slice(2, 8)}`;
}

function addActivity(state: DemoState, kind: ActivityKind, label: string, at: string): Activity[] {
  return [{ id: makeId("act"), kind, label, at }, ...state.activity].slice(0, 40);
}

function addNotification(
  state: DemoState,
  notification: Omit<AppNotification, "id" | "read" | "createdAt">,
  at: string
): AppNotification[] {
  return [
    { ...notification, id: makeId("ntf"), read: false, createdAt: at },
    ...state.notifications,
  ];
}

/** Issues a certificate when a course is fully complete and its assessment is passed. */
function tryIssueCertificate(state: DemoState, courseId: string, at: string, catalogCourses?: Course[]): DemoState {
  const course = resolveCourse(courseId, catalogCourses);
  if (!course) return state;

  const enrollment = state.enrollments.find((e) => e.courseId === courseId);
  const best = bestResult(state.quizResults, courseId);
  if (!enrollment || !best || !best.passed) return state;
  if (enrollment.completedModules.length < course.modules.length) return state;
  if (state.certificates.some((c) => c.courseId === courseId)) return state;

  const certificate: Certificate = {
    id: `CC-2026-${Math.random().toString(36).slice(2, 6).toUpperCase()}`,
    courseId,
    courseTitle: course.title,
    traineeName: state.profile.name,
    traineeId: "trn-1042",
    score: best.score,
    issuedAt: at,
  };

  return {
    ...state,
    certificates: [certificate, ...state.certificates],
    notifications: addNotification(
      { ...state },
      {
        kind: "achievement",
        title: "Certificate issued",
        body: `You have earned a certificate for ${course.title}.`,
        href: "/trainee/certificates",
      },
      at
    ),
    activity: addActivity(state, "certificate-earned", `Earned certificate — ${course.title}`, at),
  };
}

export function bestResult(results: QuizResult[], courseId: string): QuizResult | undefined {
  return results
    .filter((r) => r.courseId === courseId)
    .sort((a, b) => b.score - a.score)[0];
}

/** Consistent with the certification rule enforced by tryIssueCertificate. */
export function isCourseComplete(enrollment: Enrollment, courseModuleCount: number): boolean {
  return enrollment.completedModules.length >= courseModuleCount;
}

function reducer(state: DemoState, action: DemoAction): DemoState {
  switch (action.type) {
    case "HYDRATE":
      return action.state;

    case "ENROLL": {
      if (state.enrollments.some((e) => e.courseId === action.courseId)) return state;
      const next: DemoState = {
        ...state,
        enrollments: [
          ...state.enrollments,
          { courseId: action.courseId, status: "active", enrolledAt: action.at, completedModules: [] },
        ],
        activity: addActivity(state, "enrolled", `Enrolled in ${resolveCourse(action.courseId, action.catalogCourses)?.title ?? "course"}`, action.at),
      };
      return next;
    }

    case "COMPLETE_MODULE": {
      const course = resolveCourse(action.courseId, action.catalogCourses);
      if (!course) return state;
      const enrollment = state.enrollments.find((e) => e.courseId === action.courseId);
      if (!enrollment || enrollment.completedModules.includes(action.moduleId)) return state;

      const completedModules = [...enrollment.completedModules, action.moduleId];
      const nowComplete = completedModules.length >= course.modules.length;

      const updatedEnrollment: Enrollment = {
        ...enrollment,
        completedModules,
        status: nowComplete ? "completed" : "active",
        lastModuleId: action.moduleId,
      };

      let next: DemoState = {
        ...state,
        enrollments: state.enrollments.map((e) =>
          e.courseId === action.courseId ? updatedEnrollment : e
        ),
        activity: addActivity(
          state,
          "module-completed",
          `Completed module — ${course.modules.find((m) => m.id === action.moduleId)?.title ?? action.moduleId}`,
          action.at
        ),
      };

      next = tryIssueCertificate(next, action.courseId, action.at, action.catalogCourses);
      return next;
    }

    case "SUBMIT_QUIZ": {
      const assessment = ASSESSMENTS.find((a) => a.id === action.assessmentId);
      if (!assessment) return state;

      const correct = assessment.questions.filter(
        (q) => action.answers[q.id] === q.answerIndex
      ).length;
      const score = Math.round((correct / assessment.questions.length) * 100);
      const passed = score >= assessment.passMark;

      const result: QuizResult = {
        assessmentId: assessment.id,
        courseId: assessment.courseId,
        score,
        passed,
        answers: action.answers,
        attemptedAt: action.at,
      };

      let next: DemoState = {
        ...state,
        quizResults: [result, ...state.quizResults],
        activity: addActivity(
          state,
          passed ? "quiz-passed" : "quiz-failed",
          `${passed ? "Passed" : "Attempted"} ${assessment.title} (${score}%)`,
          action.at
        ),
      };

      next = tryIssueCertificate(next, assessment.courseId, action.at, action.catalogCourses);
      return next;
    }

    case "SUBMIT_FEEDBACK": {
      const course = resolveCourse(action.courseId, action.catalogCourses);
      const existing = state.feedback.some((f) => f.courseId === action.courseId);
      const next: DemoState = {
        ...state,
        feedback: existing
          ? state.feedback.map((f) =>
              f.courseId === action.courseId
                ? { ...f, rating: action.rating, relevanceComment: action.relevanceComment, trainerComment: action.trainerComment, submittedAt: action.at }
                : f
            )
          : [
              {
                courseId: action.courseId,
                rating: action.rating,
                relevanceComment: action.relevanceComment,
                trainerComment: action.trainerComment,
                submittedAt: action.at,
              },
              ...state.feedback,
            ],
        activity: existing
          ? state.activity
          : addActivity(state, "feedback-submitted", `Feedback submitted — ${course?.title ?? "course"}`, action.at),
      };
      return next;
    }

    case "SUBMIT_QUESTIONNAIRE": {
      const questionnaire = QUESTIONNAIRES.find((q) => q.id === action.questionnaireId);
      if (!questionnaire || state.questionnaireResponses.some((r) => r.questionnaireId === action.questionnaireId)) {
        return state;
      }
      const next: DemoState = {
        ...state,
        questionnaireResponses: [
          { questionnaireId: action.questionnaireId, answers: action.answers, submittedAt: action.at },
          ...state.questionnaireResponses,
        ],
        activity: addActivity(state, "questionnaire-submitted", `Questionnaire submitted — ${questionnaire.title}`, action.at),
      };
      return next;
    }

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
      return {
        ...state,
        notifications: state.notifications.map((n) => ({ ...n, read: true })),
      };

    case "MERGE_CATALOG": {
      // Admin-published announcements and content notes become trainee
      // notifications exactly once (tracked by id).
      const fresh = [
        ...action.announcements.map((a) => ({
          id: a.id,
          kind: "announcement" as const,
          title: a.title,
          body: a.body,
          createdAt: a.publishedAt,
          href: "/trainee/notifications",
        })),
        ...action.contentPosts.map((p) => ({
          id: p.id,
          kind: "content" as const,
          title: p.title,
          body: p.body,
          createdAt: p.publishedAt,
          href: p.href ?? "/trainee/explore",
        })),
      ].filter((n) => !state.seenAnnouncementIds.includes(n.id));
      if (fresh.length === 0) return state;
      return {
        ...state,
        seenAnnouncementIds: [...state.seenAnnouncementIds, ...fresh.map((n) => n.id)],
        notifications: [...fresh.map((n) => ({ ...n, read: false })), ...state.notifications],
      };
    }

    case "RESET":
      return seedState();
  }
}

/* --------------------------------- Seed --------------------------------- */

function seedState(): DemoState {
  return {
    version: 1,
    enrollments: [
      {
        courseId: "now-102",
        status: "active",
        enrolledAt: "2026-08-05T10:00:00",
        completedModules: ["now-102-m1", "now-102-m2", "now-102-m3"],
        lastModuleId: "now-102-m4",
      },
      {
        courseId: "nwp-101",
        status: "active",
        enrolledAt: "2026-08-20T09:00:00",
        completedModules: ["nwp-101-m1"],
        lastModuleId: "nwp-101-m2",
      },
      {
        courseId: "sat-110",
        status: "completed",
        enrolledAt: "2026-07-01T09:00:00",
        completedModules: ["sat-110-m1", "sat-110-m2", "sat-110-m3", "sat-110-m4"],
        lastModuleId: "sat-110-m4",
      },
    ],
    quizResults: [
      {
        assessmentId: "quiz-sat-110",
        courseId: "sat-110",
        score: 80,
        passed: true,
        answers: { "sat-q1": 1, "sat-q2": 2, "sat-q3": 1, "sat-q4": 1, "sat-q5": 1 },
        attemptedAt: "2026-08-18T16:10:00",
      },
    ],
    certificates: [
      {
        id: "CC-2026-K4TQ",
        courseId: "sat-110",
        courseTitle: "Satellite Meteorology & Image Interpretation",
        traineeName: TRAINEE_PROFILE.name,
        traineeId: "trn-1042",
        score: 80,
        issuedAt: "2026-08-18T16:20:00",
      },
    ],
    feedback: [],
    questionnaireResponses: [],
    notifications: [
      {
        id: "ntf-seed-1",
        kind: "announcement",
        title: ANNOUNCEMENTS[0].title,
        body: ANNOUNCEMENTS[0].body,
        createdAt: ANNOUNCEMENTS[0].publishedAt,
        read: false,
        href: "/trainee/explore",
      },
      {
        id: "ntf-seed-2",
        kind: "deadline",
        title: "Questionnaire closing soon",
        body: `${QUESTIONNAIRES[1].title} is due on ${QUESTIONNAIRES[1].deadline}. Your response shapes the next cohort.`,
        createdAt: "2026-09-08T09:00:00",
        read: false,
        href: "/trainee/dashboard",
      },
      {
        id: "ntf-seed-3",
        kind: "achievement",
        title: ACHIEVEMENTS[1].title,
        body: ACHIEVEMENTS[1].description,
        createdAt: ACHIEVEMENTS[1].earnedAt,
        read: true,
        href: "/trainee/certificates",
      },
      {
        id: "ntf-seed-4",
        kind: "content",
        title: "New case pack added to NOW-102",
        body: "Module 5 now includes a guided case study: 12 July convective event, with radar loop excerpts.",
        createdAt: "2026-09-02T15:30:00",
        read: true,
        href: "/trainee/my-learning",
      },
    ],
    achievements: ACHIEVEMENTS,
    activity: [
      { id: "act-seed-1", kind: "module-completed", label: "Completed module — Satellite & Station Blending", at: "2026-09-09T17:25:00" },
      { id: "act-seed-2", kind: "module-completed", label: "Completed module — Introduction to Numerical Weather Prediction", at: "2026-09-07T11:40:00" },
      { id: "act-seed-3", kind: "certificate-earned", label: "Earned certificate — Satellite Meteorology & Image Interpretation", at: "2026-08-18T16:20:00" },
    ],
    profile: TRAINEE_PROFILE,
    seenAnnouncementIds: [],
  };
}

/* -------------------------------- Context -------------------------------- */

interface DemoStoreValue {
  state: DemoState;
  /** True once localStorage has been read — views show skeletons until then. */
  hydrated: boolean;
  userId: string;
  /** Trainer-published courses + module resources (shared catalog). */
  catalog: SharedCatalog;
  /** Curated demo catalog + trainer-published courses. */
  allCourses: Course[];
  findCourse: (courseId: string) => Course | undefined;
  /** Library items a trainer attached to a specific module. */
  resourcesFor: (courseId: string, moduleId: string) => PublishedResource[];
  enroll: (courseId: string) => void;
  completeModule: (courseId: string, moduleId: string) => void;
  submitQuiz: (assessmentId: string, answers: Record<string, number>) => void;
  submitFeedback: (courseId: string, rating: number, relevanceComment: string, trainerComment: string) => void;
  submitQuestionnaire: (questionnaireId: string, answers: Record<string, string>) => void;
  updateProfile: (patch: Partial<TraineeProfile>) => void;
  markRead: (notificationId: string) => void;
  markAllRead: () => void;
  resetDemo: () => void;
}

const DemoStoreContext = createContext<DemoStoreValue | null>(null);

export function DemoStoreProvider({
  userId,
  children,
}: {
  userId: string;
  children: ReactNode;
}) {
  const storageKey = `${STORAGE_PREFIX}-${userId}`;
  const [state, dispatch] = useReducer(reducer, undefined, seedState);
  const [hydrated, setHydrated] = useState(false);
  const [catalog, setCatalog] = useState<SharedCatalog>(() => ({
    version: 1,
    courses: [],
    resources: [],
    announcements: [],
    contentPosts: [],
  }));

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(storageKey);
      if (raw) {
        const parsed = JSON.parse(raw) as DemoState;
        if (parsed.version === 1 && Array.isArray(parsed.enrollments)) {
          dispatch({
            type: "HYDRATE",
            state: { ...parsed, seenAnnouncementIds: parsed.seenAnnouncementIds ?? [] },
          });
        }
      }
    } catch {
      // corrupted storage — seed state stands
    }
    // One-time client hydration flag; storage reads are impossible during SSR.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setHydrated(true);
  }, [storageKey]);

  // Trainer publishes land in the shared catalog; keep the trainee view of it
  // live within this tab and across tabs. Admin announcements and content
  // notes in the catalog become notifications exactly once.
  useEffect(() => {
    const refresh = () => {
      const shared = readSharedCatalog();
      setCatalog(shared);
      if (shared.announcements.length > 0 || shared.contentPosts.length > 0) {
        dispatch({
          type: "MERGE_CATALOG",
          announcements: shared.announcements,
          contentPosts: shared.contentPosts,
        });
      }
    };
    refresh();
    window.addEventListener("cc-catalog-changed", refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener("cc-catalog-changed", refresh);
      window.removeEventListener("storage", refresh);
    };
  }, []);

  // Persist on every change after hydration.
  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(storageKey, JSON.stringify(state));
    } catch {
      // storage full or unavailable — demo continues without persistence
    }
  }, [state, hydrated, storageKey]);

  const now = useCallback(() => new Date().toISOString(), []);
  const catalogCourses = catalog.courses;
  const enroll = useCallback(
    (courseId: string) => dispatch({ type: "ENROLL", courseId, at: now(), catalogCourses }),
    [now, catalogCourses]
  );
  const completeModule = useCallback(
    (courseId: string, moduleId: string) =>
      dispatch({ type: "COMPLETE_MODULE", courseId, moduleId, at: now(), catalogCourses }),
    [now, catalogCourses]
  );
  const submitQuiz = useCallback(
    (assessmentId: string, answers: Record<string, number>) =>
      dispatch({ type: "SUBMIT_QUIZ", assessmentId, answers, at: now(), catalogCourses }),
    [now, catalogCourses]
  );
  const submitFeedback = useCallback(
    (courseId: string, rating: number, relevanceComment: string, trainerComment: string) =>
      dispatch({ type: "SUBMIT_FEEDBACK", courseId, rating, relevanceComment, trainerComment, at: now(), catalogCourses }),
    [now, catalogCourses]
  );
  const submitQuestionnaire = useCallback(
    (questionnaireId: string, answers: Record<string, string>) =>
      dispatch({ type: "SUBMIT_QUESTIONNAIRE", questionnaireId, answers, at: now() }),
    [now]
  );
  const updateProfile = useCallback((patch: Partial<TraineeProfile>) => dispatch({ type: "UPDATE_PROFILE", patch }), []);
  const markRead = useCallback((notificationId: string) => dispatch({ type: "MARK_READ", notificationId }), []);
  const markAllRead = useCallback(() => dispatch({ type: "MARK_ALL_READ" }), []);
  const resetDemo = useCallback(() => dispatch({ type: "RESET", at: now() }), [now]);

  const allCourses = useMemo(() => [...COURSES, ...catalog.courses], [catalog.courses]);
  const findCourse = useCallback(
    (courseId: string) => getCourse(courseId) ?? catalog.courses.find((c) => c.id === courseId),
    [catalog.courses]
  );
  const resourcesFor = useCallback(
    (courseId: string, moduleId: string) =>
      catalog.resources.filter((r) => r.courseId === courseId && r.moduleId === moduleId),
    [catalog.resources]
  );

  const value = useMemo(
    () => ({
      state,
      hydrated,
      userId,
      catalog,
      allCourses,
      findCourse,
      resourcesFor,
      enroll,
      completeModule,
      submitQuiz,
      submitFeedback,
      submitQuestionnaire,
      updateProfile,
      markRead,
      markAllRead,
      resetDemo,
    }),
    [state, hydrated, userId, catalog, allCourses, findCourse, resourcesFor, enroll, completeModule, submitQuiz, submitFeedback, submitQuestionnaire, updateProfile, markRead, markAllRead, resetDemo]
  );

  return <DemoStoreContext.Provider value={value}>{children}</DemoStoreContext.Provider>;
}

export function useDemoStore(): DemoStoreValue {
  const ctx = useContext(DemoStoreContext);
  if (!ctx) throw new Error("useDemoStore must be used within DemoStoreProvider");
  return ctx;
}
