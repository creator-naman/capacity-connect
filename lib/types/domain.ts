/**
 * CAPACITY CONNECT — domain model.
 *
 * These interfaces are the contract between the UI and the data layer.
 * When Supabase arrives, table rows map onto these shapes in the data
 * access layer; no page or component should need to change.
 *
 * Demo data lives in `lib/data/demo` and never inside components.
 */

export type CourseLevel = "beginner" | "intermediate" | "advanced";

export type ResourceKind = "recorded-lecture" | "presentation" | "study-material" | "dataset" | "reference";

export interface LearningResource {
  id: string;
  title: string;
  kind: ResourceKind;
  /** Duration in minutes for watchable material. */
  minutes?: number;
  /** File-format hint shown in the UI, e.g. "PDF", "MP4", "PPTX". */
  format: string;
  /** Demo resources are descriptive placeholders; a real deployment
   *  stores media in object storage and this becomes a signed URL. */
  ref: string;
}

export interface CourseModule {
  id: string;
  title: string;
  summary: string;
  minutes: number;
  resources: LearningResource[];
}

export interface Course {
  id: string;
  code: string;
  title: string;
  description: string;
  category: string;
  /** Fine-grained subject line, e.g. "Data assimilation". */
  subject?: string;
  level: CourseLevel;
  /** Total contact time in hours, derived from modules but stored for display. */
  hours: number;
  trainerId: string;
  trainerName: string;
  outcomes: string[];
  modules: CourseModule[];
  addedAt: string; // ISO date
  tags: string[];
  /**
   * Trainer-authored courses carry an explicit lifecycle: drafts are visible
   * only to the author, published courses join the shared catalog. Curated
   * catalog courses (demo data) are implicitly published.
   */
  status?: "draft" | "published";
}

/* ------------------------------ Enrollment ------------------------------ */

export type EnrollmentStatus = "active" | "completed";

export interface Enrollment {
  courseId: string;
  status: EnrollmentStatus;
  enrolledAt: string;
  /** Module ids the trainee has marked complete. */
  completedModules: string[];
  /** id of the module the trainee should resume from, if any. */
  lastModuleId?: string;
}

/* ------------------------------ Assessment ------------------------------ */

export interface Question {
  id: string;
  prompt: string;
  options: string[];
  /** Index of the correct option in `options`. */
  answerIndex: number;
  explanation: string;
}

export interface Assessment {
  id: string;
  courseId: string;
  title: string;
  subject: string;
  /** Passing percentage (0-100). */
  passMark: number;
  timeLimitMinutes: number;
  questions: Question[];
}

export interface QuizResult {
  assessmentId: string;
  courseId: string;
  score: number; // percentage 0-100
  passed: boolean;
  /** Chosen option index per question id. */
  answers: Record<string, number>;
  attemptedAt: string;
}

/* ------------------------------ Certificate ----------------------------- */

export interface Certificate {
  id: string;
  courseId: string;
  courseTitle: string;
  traineeName: string;
  traineeId: string;
  score: number;
  issuedAt: string;
}

/* ------------------------------- Feedback ------------------------------- */

export interface CourseFeedback {
  courseId: string;
  /** 1-5. */
  rating: number;
  relevanceComment: string;
  trainerComment: string;
  submittedAt: string;
}

/* ----------------------------- Questionnaire ---------------------------- */

export interface QuestionnaireQuestion {
  id: string;
  prompt: string;
  type: "text" | "rating" | "choice";
  options?: string[];
}

export interface Questionnaire {
  id: string;
  title: string;
  description: string;
  trainerName: string;
  deadline: string; // ISO date
  questions: QuestionnaireQuestion[];
}

export interface QuestionnaireResponse {
  questionnaireId: string;
  answers: Record<string, string>;
  submittedAt: string;
}

/* ----------------------------- Notifications ---------------------------- */

export type NotificationKind = "announcement" | "achievement" | "deadline" | "system" | "content";

export interface AppNotification {
  id: string;
  kind: NotificationKind;
  title: string;
  body: string;
  createdAt: string;
  read: boolean;
  /** Optional deep link inside the portal. */
  href?: string;
}

export interface Announcement {
  id: string;
  title: string;
  body: string;
  publishedAt: string;
  audience: "all" | "trainee" | "trainer";
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: "award" | "flame" | "target" | "rocket" | "medal";
  earnedAt: string;
}

/* -------------------------------- Activity ------------------------------ */

export type ActivityKind =
  | "enrolled"
  | "module-completed"
  | "quiz-passed"
  | "quiz-failed"
  | "certificate-earned"
  | "feedback-submitted"
  | "questionnaire-submitted"
  | "profile-updated";

export interface Activity {
  id: string;
  kind: ActivityKind;
  label: string;
  at: string;
}

/* ---------------------------- Trainer / Admin --------------------------- */

export interface TrainerProfile {
  id: string;
  name: string;
  title: string;
  specialisation: string;
  yearsExperience: number;
  expertise: string[];
  coursesTaught: string[];
  bio: string;
}

/** Metadata for a stored media file (bytes live in object storage, never inline). */
export interface StoredFileMeta {
  /** Storage path or key — a Supabase Storage path in REAL mode, a local
   *  demo-uploads key in demo mode. Never a fabricated URL. */
  path: string;
  name: string;
  bytes: number;
  mime: string;
}

/** A resource in a trainer's personal library, uploadable into course modules. */
export interface LibraryItem {
  id: string;
  title: string;
  kind: ResourceKind;
  format: string;
  minutes?: number;
  description: string;
  addedAt: string;
  /** Present when the trainer uploaded an actual file; absent for
   *  descriptive demo-only items. */
  file?: StoredFileMeta;
}

/** What a subject requires, used by competency mapping. */
export interface CompetencyRequirement {
  id: string;
  subject: string;
  skills: string[];
  minYearsExperience: number;
}

export interface TrainerMatchFactor {
  label: string;
  /** 0-1 normalised contribution. */
  weight: number;
  detail: string;
}

export interface TrainerMatch {
  trainer: TrainerProfile;
  /** 0-100 overall suitability. */
  score: number;
  factors: TrainerMatchFactor[];
}

/* ------------------------------- Trainee -------------------------------- */

export interface Qualification {
  id: string;
  degree: string;
  institution: string;
  year: number;
}

export interface ExperienceEntry {
  id: string;
  role: string;
  organisation: string;
  period: string;
  summary: string;
}

export interface TraineeProfile {
  name: string;
  email: string;
  phone: string;
  designation: string;
  region: string;
  joinedOn: string;
  qualifications: Qualification[];
  experience: ExperienceEntry[];
  skills: string[];
  interests: string[];
}
