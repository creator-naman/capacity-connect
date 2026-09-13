import type {
  CompetencyRequirement,
  TrainerMatch,
  TrainerMatchFactor,
} from "@/lib/types/domain";
import { TRAINERS } from "./portal";

/**
 * DEMO competency matching. Deterministic and explainable: every match
 * carries the factors behind its score. Weights are fixed product rules —
 * subject skill overlap dominates, verified experience supports it, and an
 * active teaching portfolio contributes marginally.
 *
 * score = 55% skill coverage + 35% experience vs requirement + 10% active teaching
 */
const WEIGHT_SKILLS = 0.55;
const WEIGHT_EXPERIENCE = 0.35;
const WEIGHT_TEACHING = 0.1;

export function matchTrainers(requirement: CompetencyRequirement): TrainerMatch[] {
  return TRAINERS.map((trainer) => {
    const matchedSkills = requirement.skills.filter((skill) =>
      trainer.expertise.some((area) => area.toLowerCase() === skill.toLowerCase())
    );
    const coverage = requirement.skills.length
      ? matchedSkills.length / requirement.skills.length
      : 0;
    const experience = Math.min(1, trainer.yearsExperience / Math.max(1, requirement.minYearsExperience));
    const teaching = trainer.coursesTaught.length > 0 ? 1 : 0;

    const score = Math.round(
      100 * (WEIGHT_SKILLS * coverage + WEIGHT_EXPERIENCE * experience + WEIGHT_TEACHING * teaching)
    );

    const factors: TrainerMatchFactor[] = [
      {
        label: "Subject expertise overlap",
        weight: WEIGHT_SKILLS,
        detail:
          matchedSkills.length > 0
            ? `${matchedSkills.length} of ${requirement.skills.length} required skills matched (${matchedSkills.join(", ")})`
            : "None of the required skills appear in this trainer's expertise",
      },
      {
        label: "Experience vs requirement",
        weight: WEIGHT_EXPERIENCE,
        detail: `${trainer.yearsExperience} years against a ${requirement.minYearsExperience}-year minimum`,
      },
      {
        label: "Active teaching portfolio",
        weight: WEIGHT_TEACHING,
        detail:
          trainer.coursesTaught.length > 0
            ? `Currently teaching ${trainer.coursesTaught.length} course(s) on the platform`
            : "No courses in the current catalog",
      },
    ];

    return { trainer, score, factors };
  }).sort((a, b) => b.score - a.score);
}
