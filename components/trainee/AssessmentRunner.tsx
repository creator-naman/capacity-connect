"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Clock,
  CircleCheck,
  CircleX,
  ClipboardCheck,
  RotateCcw,
  AlertTriangle,
} from "lucide-react";
import { getAssessment } from "@/lib/data/demo/assessments";
import { getCourse } from "@/lib/data/demo/courses";
import { useDemoStore } from "@/lib/store/demo-store";
import { buttonClassName } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Modal } from "@/components/ui/Modal";

type Phase = "intro" | "running" | "result";

interface Outcome {
  score: number;
  passed: boolean;
  answers: Record<string, number>;
}

/**
 * Guided MCQ runner: intro → timed questions → scored result with a
 * per-question review. Auto-submits when the timer expires; unanswered
 * questions score as incorrect. The attempt is recorded by the store.
 */
export function AssessmentRunner({ assessmentId }: { assessmentId: string }) {
  const { state, hydrated, submitQuiz } = useDemoStore();
  const assessment = getAssessment(assessmentId);
  const course = assessment ? getCourse(assessment.courseId) : undefined;
  const enrollment = state.enrollments.find((e) => e.courseId === assessment?.courseId);

  const [phase, setPhase] = useState<Phase>("intro");
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [remaining, setRemaining] = useState(0);
  const [outcome, setOutcome] = useState<Outcome | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const expiryRef = useRef(0);

  // Countdown while running; expiry auto-submits whatever is answered.
  // Unanswered questions score as incorrect, matching the store's formula.
  useEffect(() => {
    if (phase !== "running" || !assessment) return;
    const timer = window.setInterval(() => {
      const left = Math.max(0, Math.round((expiryRef.current - Date.now()) / 1000));
      setRemaining(left);
      if (left === 0) {
        window.clearInterval(timer);
        const correct = assessment.questions.filter(
          (q) => answers[q.id] === q.answerIndex
        ).length;
        const score = Math.round((correct / assessment.questions.length) * 100);
        setOutcome({ score, passed: score >= assessment.passMark, answers });
        setPhase("result");
        submitQuiz(assessment.id, answers);
      }
    }, 1000);
    return () => window.clearInterval(timer);
  }, [phase, answers, assessment, submitQuiz]);

  const answeredCount = assessment
    ? assessment.questions.filter((q) => answers[q.id] !== undefined).length
    : 0;

  if (!hydrated) {
    return (
      <div className="flex flex-col gap-4" role="status" aria-label="Loading">
        <span className="sr-only">Loading…</span>
        <div className="h-7 w-2/3 animate-pulse rounded-[var(--radius-sm)] bg-surface-sunken" />
        <div className="h-64 animate-pulse rounded-[var(--radius-md)] bg-surface-sunken" />
      </div>
    );
  }

  if (!assessment || !course) {
    return (
      <div className="flex flex-col items-center gap-4 py-16 text-center">
        <p className="text-sm font-semibold text-ink">Assessment not found</p>
        <Link href="/trainee/assessments" className={buttonClassName("secondary", "sm")}>
          Back to Assessments
        </Link>
      </div>
    );
  }

  if (!enrollment) {
    return (
      <div className="flex flex-col items-center gap-4 py-16 text-center">
        <AlertTriangle size={28} strokeWidth={1.5} className="text-warning" />
        <div>
          <p className="text-sm font-semibold text-ink">Not enrolled</p>
          <p className="mt-1 max-w-sm text-sm text-ink-secondary">
            This assessment belongs to {course.code}, which you haven&apos;t enrolled in yet.
          </p>
        </div>
        <Link href={`/trainee/explore/${course.id}`} className={buttonClassName("primary", "sm")}>
          View {course.code}
        </Link>
      </div>
    );
  }

  // Plain functions (no useCallback) so the React Compiler can optimize freely.
  function start() {
    if (!assessment) return;
    setAnswers({});
    setIndex(0);
    setOutcome(null);
    setRemaining(assessment.timeLimitMinutes * 60);
    expiryRef.current = Date.now() + assessment.timeLimitMinutes * 60_000;
    setPhase("running");
  }

  function finish(finalAnswers: Record<string, number>) {
    if (!assessment) return;
    const correct = assessment.questions.filter(
      (q) => finalAnswers[q.id] === q.answerIndex
    ).length;
    const score = Math.round((correct / assessment.questions.length) * 100);
    setOutcome({ score, passed: score >= assessment.passMark, answers: finalAnswers });
    setPhase("result");
    submitQuiz(assessment.id, finalAnswers);
  }

  const question = assessment.questions[index];

  /* ------------------------------- intro ------------------------------- */
  if (phase === "intro") {
    const attempts = state.quizResults.filter((r) => r.assessmentId === assessment.id);
    const best = attempts.slice().sort((a, b) => b.score - a.score)[0];
    return (
      <div className="flex flex-col gap-5">
        <Link
          href="/trainee/assessments"
          className="flex w-fit items-center gap-1.5 text-sm text-ink-secondary transition-colors hover:text-ink"
        >
          <ArrowLeft size={15} strokeWidth={1.75} />
          Assessments
        </Link>

        <Card className="flex flex-col gap-5 p-6">
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone="neutral">{course.code}</Badge>
            {best ? (
              best.passed ? (
                <Badge tone="success">Passed · best {best.score}%</Badge>
              ) : (
                <Badge tone="warning">Best attempt {best.score}%</Badge>
              )
            ) : (
              <Badge tone="info">First attempt</Badge>
            )}
          </div>
          <div>
            <h1 className="text-xl font-semibold text-ink">{assessment.title}</h1>
            <p className="mt-1 text-sm text-ink-secondary">Subject: {assessment.subject}</p>
          </div>

          <dl className="grid grid-cols-3 gap-3">
            {[
              { label: "Questions", value: String(assessment.questions.length) },
              { label: "Pass mark", value: `${assessment.passMark}%` },
              { label: "Time limit", value: `${assessment.timeLimitMinutes} min` },
            ].map((item) => (
              <div key={item.label} className="rounded-[var(--radius-sm)] bg-surface-sunken px-3.5 py-3">
                <dt className="text-xs text-ink-muted">{item.label}</dt>
                <dd className="mt-0.5 font-mono text-lg tabular-nums text-ink">{item.value}</dd>
              </div>
            ))}
          </dl>

          <ul className="flex flex-col gap-1.5 text-xs leading-relaxed text-ink-secondary">
            <li>· One attempt runs to the timer; it auto-submits when time runs out.</li>
            <li>· Unanswered questions score as incorrect — an answer can be changed until submit.</li>
            <li>· Every question includes an explanation in the review after submitting.</li>
          </ul>

          <div className="flex items-center gap-3">
            <button type="button" className={buttonClassName("primary", "md")} onClick={start}>
              {best ? "Retake assessment" : "Start assessment"}
            </button>
            {best?.passed ? (
              <span className="text-xs text-ink-muted">You&apos;ve already passed — retaking can only improve your record.</span>
            ) : null}
          </div>
        </Card>
      </div>
    );
  }

  /* ------------------------------- result ------------------------------ */
  if (phase === "result" && outcome) {
    return (
      <div className="flex flex-col gap-5">
        <Card className="flex flex-col gap-4 p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="text-lg font-semibold text-ink">{assessment.title}</h1>
              <p className="mt-0.5 text-sm text-ink-secondary">{course.title}</p>
            </div>
            <div className="flex items-center gap-3">
              <span
                className={
                  "font-mono text-4xl font-medium tabular-nums " +
                  (outcome.passed ? "text-success" : "text-error")
                }
              >
                {outcome.score}%
              </span>
              {outcome.passed ? (
                <Badge tone="success">
                  <CircleCheck size={13} strokeWidth={2} className="mr-1" />
                  Passed
                </Badge>
              ) : (
                <Badge tone="error">Below {assessment.passMark}%</Badge>
              )}
            </div>
          </div>
          <ProgressBar value={outcome.score} label={`Pass mark ${assessment.passMark}%`} size="sm" />
          <p className="text-sm leading-relaxed text-ink-secondary">
            {outcome.passed
              ? course.modules.every((m) => enrollment.completedModules.includes(m.id))
                ? "With all modules complete, this pass counts towards your certificate."
                : "Complete the remaining modules in My Learning to finish the certification path."
              : `You need ${assessment.passMark}% to pass. Review the explanations below and retake when ready.`}
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <button type="button" className={buttonClassName(outcome.passed ? "secondary" : "primary", "sm")} onClick={() => start()}>
              <RotateCcw size={14} strokeWidth={1.75} />
              Retake
            </button>
            <Link href="/trainee/assessments" className={buttonClassName("ghost", "sm")}>
              All assessments
            </Link>
            <Link href="/trainee/my-learning" className={buttonClassName("ghost", "sm")}>
              My Learning
            </Link>
          </div>
        </Card>

        <section aria-labelledby="review" className="flex flex-col gap-3">
          <h2 id="review" className="text-sm font-semibold text-ink">
            Answer review
          </h2>
          <div className="flex flex-col gap-3">
            {assessment.questions.map((q, i) => {
              const chosen = outcome.answers[q.id];
              const correct = chosen === q.answerIndex;
              return (
                <Card key={q.id} className="flex flex-col gap-2.5 p-5">
                  <div className="flex items-start justify-between gap-3">
                    <p className="text-sm font-medium leading-snug text-ink">
                      {i + 1}. {q.prompt}
                    </p>
                    {correct ? (
                      <CircleCheck size={17} strokeWidth={1.75} className="mt-0.5 shrink-0 text-success" />
                    ) : (
                      <CircleX size={17} strokeWidth={1.75} className="mt-0.5 shrink-0 text-error" />
                    )}
                  </div>
                  <div className="flex flex-col gap-1 text-xs">
                    {q.options.map((option, oi) => {
                      const isAnswer = oi === q.answerIndex;
                      const isChosen = oi === chosen;
                      return (
                        <p
                          key={oi}
                          className={
                            "rounded-[var(--radius-sm)] px-2.5 py-1.5 " +
                            (isAnswer
                              ? "bg-success-soft font-medium text-success"
                              : isChosen
                                ? "bg-error-soft text-error"
                                : "text-ink-secondary")
                          }
                        >
                          {option}
                          {isAnswer ? " — correct answer" : isChosen ? " — your answer" : ""}
                        </p>
                      );
                    })}
                    {chosen === undefined ? (
                      <p className="px-2.5 py-1 text-ink-muted">Not answered</p>
                    ) : null}
                  </div>
                  <p className="border-t border-border pt-2.5 text-xs leading-relaxed text-ink-secondary">
                    {q.explanation}
                  </p>
                </Card>
              );
            })}
          </div>
        </section>
      </div>
    );
  }

  /* ------------------------------ running ------------------------------ */
  if (!question) return null;

  const minutes = Math.floor(remaining / 60);
  const seconds = String(remaining % 60).padStart(2, "0");
  const lowTime = remaining <= 60;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Badge tone="neutral">{course.code}</Badge>
          <span className="text-xs text-ink-muted">
            Question {index + 1} of {assessment.questions.length}
          </span>
        </div>
        <span
          role="timer"
          className={
            "flex items-center gap-1.5 rounded-[var(--radius-sm)] px-2.5 py-1 font-mono text-sm tabular-nums " +
            (lowTime ? "bg-error-soft text-error" : "bg-surface-sunken text-ink-secondary")
          }
        >
          <Clock size={14} strokeWidth={1.75} />
          {minutes}:{seconds}
        </span>
      </div>

      <ProgressBar
        value={((index + 1) / assessment.questions.length) * 100}
        size="sm"
        label={`Answered ${answeredCount} of ${assessment.questions.length}`}
      />

      <Card className="flex flex-col gap-4 p-6">
        <fieldset>
          <legend className="text-base font-medium leading-snug text-ink">{question.prompt}</legend>
          <div role="radiogroup" aria-label={`Options for question ${index + 1}`} className="mt-4 flex flex-col gap-2">
            {question.options.map((option, oi) => {
              const selected = answers[question.id] === oi;
              return (
                <button
                  key={oi}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  onClick={() => setAnswers((prev) => ({ ...prev, [question.id]: oi }))}
                  className={
                    "flex items-center gap-3 rounded-[var(--radius-sm)] border px-4 py-3 text-left text-sm transition-colors duration-150 " +
                    (selected
                      ? "border-primary bg-primary-soft text-ink"
                      : "border-border-strong text-ink-secondary hover:border-ink-muted hover:text-ink")
                  }
                >
                  <span
                    className={
                      "flex h-5 w-5 shrink-0 items-center justify-center rounded-full border font-mono text-[10px] tabular-nums " +
                      (selected ? "border-primary bg-primary text-ink-inverted" : "border-border-strong text-ink-muted")
                    }
                    aria-hidden="true"
                  >
                    {String.fromCharCode(65 + oi)}
                  </span>
                  {option}
                </button>
              );
            })}
          </div>
        </fieldset>

        <div className="flex items-center justify-between border-t border-border pt-4">
          <button
            type="button"
            className={buttonClassName("ghost", "sm")}
            onClick={() => setIndex((i) => Math.max(0, i - 1))}
            disabled={index === 0}
          >
            <ArrowLeft size={14} strokeWidth={2} />
            Previous
          </button>
          {index < assessment.questions.length - 1 ? (
            <button type="button" className={buttonClassName("primary", "sm")} onClick={() => setIndex((i) => i + 1)}>
              Next
              <ArrowRight size={14} strokeWidth={2} />
            </button>
          ) : (
            <button
              type="button"
              className={buttonClassName("primary", "sm")}
              onClick={() => setConfirmOpen(true)}
            >
              <ClipboardCheck size={14} strokeWidth={1.75} />
              Submit assessment
            </button>
          )}
        </div>
      </Card>

      {/* Question navigator */}
      <div className="flex flex-wrap items-center gap-1.5">
        {assessment.questions.map((q, qi) => {
          const answered = answers[q.id] !== undefined;
          return (
            <button
              key={q.id}
              type="button"
              aria-label={`Go to question ${qi + 1}${answered ? ", answered" : ""}`}
              aria-current={qi === index ? "true" : undefined}
              onClick={() => setIndex(qi)}
              className={
                "h-8 w-8 rounded-[var(--radius-sm)] border font-mono text-xs tabular-nums transition-colors " +
                (qi === index
                  ? "border-primary bg-primary text-ink-inverted"
                  : answered
                    ? "border-border-strong bg-surface-sunken text-ink"
                    : "border-border text-ink-muted hover:border-border-strong")
              }
            >
              {qi + 1}
            </button>
          );
        })}
      </div>

      {/* Submit from any question */}
      {index < assessment.questions.length - 1 ? (
        <div className="flex justify-end">
          <button type="button" className={buttonClassName("secondary", "sm")} onClick={() => setConfirmOpen(true)}>
            Submit assessment
          </button>
        </div>
      ) : null}

      <Modal
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        title="Submit assessment?"
        footer={
          <>
            <button type="button" className={buttonClassName("ghost", "sm")} onClick={() => setConfirmOpen(false)}>
              Keep working
            </button>
            <button
              type="button"
              className={buttonClassName("primary", "sm")}
              onClick={() => {
                setConfirmOpen(false);
                finish(answers);
              }}
            >
              Submit now
            </button>
          </>
        }
      >
        <p className="text-sm leading-relaxed text-ink-secondary">
          {answeredCount === assessment.questions.length
            ? "All questions are answered. Submitting records this attempt and shows the full review."
            : `${assessment.questions.length - answeredCount} of ${assessment.questions.length} questions are unanswered — unanswered questions score as incorrect.`}
        </p>
      </Modal>
    </div>
  );
}
