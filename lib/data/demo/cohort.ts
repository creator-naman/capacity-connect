import type { Course } from "@/lib/types/domain";
import { COURSES } from "./courses";

/**
 * DEMO trainee cohort for trainer monitoring views. Deterministic — derived
 * from course ids with a stable hash so progress and scores never jump
 * between renders or reloads. With Supabase this file is replaced by
 * enrollment/quiz-result queries; the view props stay identical.
 */

export interface CohortTrainee {
  id: string;
  name: string;
  designation: string;
  region: string;
  /** ISO datetime of last platform activity. */
  lastActiveAt: string;
  /** courseId → 0-100 module progress. */
  progress: Record<string, number>;
  /** courseId → best assessment score; absent when not attempted. */
  scores: Record<string, number>;
}

/** Small deterministic hash → 0-1. */
function stableUnit(seed: string): number {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i += 1) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return ((h >>> 0) % 1000) / 1000;
}

const ROSTER: Array<Pick<CohortTrainee, "id" | "name" | "designation" | "region">> = [
  { id: "trn-1042", name: "Ananya Verma", designation: "Scientist-B", region: "RMC New Delhi" },
  { id: "trn-1051", name: "Kavya Sharma", designation: "Scientist-B", region: "RMC Mumbai" },
  { id: "trn-1053", name: "Rohan Pillai", designation: "Meteorologist-A", region: "MC Hyderabad" },
  { id: "trn-1060", name: "Ishita Bose", designation: "Project Scientist", region: "RMC Kolkata" },
  { id: "trn-1063", name: "Devansh Reddy", designation: "Scientist-B", region: "MC Chennai" },
  { id: "trn-1071", name: "Priya Nambisan", designation: "Meteorologist-C", region: "MC Thiruvananthapuram" },
  { id: "trn-1078", name: "Aditya Kulkarni", designation: "Project Scientist", region: "RMC Nagpur" },
  { id: "trn-1084", name: "Sneha Grewal", designation: "Scientist-B", region: "RMC New Delhi" },
  { id: "trn-1090", name: "Manav Desai", designation: "Meteorologist-A", region: "MC Ahmedabad" },
  { id: "trn-1095", name: "Tanya Sood", designation: "Project Scientist", region: "RMC New Delhi" },
];

/** Courses each trainee sits in, keyed by trainee index (deterministic). */
const ENROLLMENT_MAP: number[][] = [
  [0, 1, 2], // Ananya — the signed-in demo trainer's courses (via trainee demo state)
  [0, 1],
  [0, 2],
  [1, 2],
  [0],
  [1],
  [0, 1, 2],
  [2],
  [1, 2],
  [0, 2],
];

const ACTIVE_WINDOWS_DAYS = [0, 0, 1, 1, 2, 3, 3, 5, 6, 8];

function isoDaysAgo(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() - days);
  date.setHours(10, 30, 0, 0);
  return date.toISOString().slice(0, 16);
}

export const COHORT: CohortTrainee[] = ROSTER.map((person, index) => {
  const progress: Record<string, number> = {};
  const scores: Record<string, number> = {};
  for (const courseIndex of ENROLLMENT_MAP[index]) {
    const course = COURSES[courseIndex];
    if (!course) continue;
    const unit = stableUnit(`${person.id}:${course.id}`);
    // 0-100 module progress; completed courses get a score too.
    const pct = Math.round((unit * 0.75 + 0.2) * 100 / 5) * 5;
    progress[course.id] = Math.min(100, pct);
    const attempted = stableUnit(`${person.id}:${course.id}:score`) > 0.25;
    if (attempted) {
      scores[course.id] = Math.round(45 + stableUnit(`${person.id}:${course.id}:mark`) * 55);
    }
  }
  return { ...person, lastActiveAt: isoDaysAgo(ACTIVE_WINDOWS_DAYS[index]), progress, scores };
});

/** Trainees of the signed-in demo trainer (Dr. Rajesh Iyer) for a course. */
export function rosterForCourse(courseId: string): CohortTrainee[] {
  return COHORT.filter((trainee) => trainee.progress[courseId] !== undefined);
}

export interface CourseParticipation {
  courseId: string;
  traineeCount: number;
  /** Mean module progress across the roster, 0-100. */
  meanProgress: number;
  /** Share of the roster that attempted the assessment, 0-100. */
  attemptRate: number;
  /** Mean best score among attempts, 0-100. */
  meanScore: number;
  /** Share of roster at 100% module progress, 0-100. */
  completionRate: number;
  /** Trainees inactive for 5+ days. */
  atRiskCount: number;
}

/** Trainees inactive this many days are flagged "at risk" in monitoring views. */
export const INACTIVE_DAYS = 5;

/** Reads the current clock — call from event handlers or data helpers, not render bodies. */
export function isInactive(lastActiveAt: string): boolean {
  return (Date.now() - new Date(lastActiveAt).getTime()) / 86_400_000 >= INACTIVE_DAYS;
}

/** True when the last activity falls within `days` of now. */
export function activeWithin(lastActiveAt: string, days: number): boolean {
  return (Date.now() - new Date(lastActiveAt).getTime()) / 86_400_000 < days;
}

export function participationFor(course: Course): CourseParticipation {
  const roster = rosterForCourse(course.id);
  const count = roster.length;
  const meanProgress = count
    ? Math.round(roster.reduce((sum, t) => sum + (t.progress[course.id] ?? 0), 0) / count)
    : 0;
  const attempted = roster.filter((t) => t.scores[course.id] !== undefined);
  const attemptRate = count ? Math.round((attempted.length / count) * 100) : 0;
  const meanScore = attempted.length
    ? Math.round(attempted.reduce((sum, t) => sum + (t.scores[course.id] ?? 0), 0) / attempted.length)
    : 0;
  const completionRate = count
    ? Math.round((roster.filter((t) => (t.progress[course.id] ?? 0) >= 100).length / count) * 100)
    : 0;
  const atRiskCount = roster.filter((t) => isInactive(t.lastActiveAt)).length;
  return { courseId: course.id, traineeCount: count, meanProgress, attemptRate, meanScore, completionRate, atRiskCount };
}

/**
 * DEMO responses for a questionnaire: which cohort trainees submitted and
 * what they answered (ratings only summarised; free text sampled).
 */
export interface DemoResponseSummary {
  traineeName: string;
  region: string;
  submittedAt: string;
  /** Mean of rating-type answers for this response. */
  meanRating: number;
  freeText: string[];
}

export function responsesForQuestionnaire(questionnaireId: string): DemoResponseSummary[] {
  // Deterministic 3-6 responses per questionnaire.
  return ROSTER.slice(0, 3 + Math.floor(stableUnit(questionnaireId) * 4)).map((person, index) => {
    const rating = 3 + Math.round(stableUnit(`${questionnaireId}:${person.id}`) * 2);
    return {
      traineeName: person.name,
      region: person.region,
      submittedAt: isoDaysAgo(index + 1),
      meanRating: rating,
      freeText: index % 2 === 0
        ? ["The pacing suits operational duty rotations; evening access helps."]
        : ["Would welcome one more case lab per module."],
    };
  });
}
