import { describe, expect, it } from "vitest";
import { checkLessonUnlock, hasWatchedEnough } from "@/features/progress/unlock";

describe("checkLessonUnlock", () => {
  const baseInput = {
    previousLessonApproved: true,
    quizPassed: true,
    assignmentStatus: "approved" as const,
    bestScore: 90,
  };

  it("unlocks when all default conditions are satisfied", () => {
    const result = checkLessonUnlock(baseInput);
    expect(result.unlocked).toBe(true);
    expect(result.reasons).toEqual([]);
  });

  it("locks when the previous lesson was not approved", () => {
    const result = checkLessonUnlock({ ...baseInput, previousLessonApproved: false });
    expect(result.unlocked).toBe(false);
    expect(result.reasons).toContain("previous_lesson_incomplete");
  });

  it("locks when the quiz has not been passed", () => {
    const result = checkLessonUnlock({ ...baseInput, quizPassed: false });
    expect(result.unlocked).toBe(false);
    expect(result.reasons).toContain("quiz_not_passed");
  });

  it("does not require a passed quiz when requireQuizPass is disabled", () => {
    const result = checkLessonUnlock({ ...baseInput, quizPassed: false, rules: { requireQuizPass: false } });
    expect(result.reasons).not.toContain("quiz_not_passed");
  });

  it("locks with assignment_pending_review while a submission is still awaiting grading", () => {
    for (const status of ["submitted", "under_review", "resubmitted"] as const) {
      const result = checkLessonUnlock({ ...baseInput, assignmentStatus: status });
      expect(result.unlocked).toBe(false);
      expect(result.reasons).toContain("assignment_pending_review");
    }
  });

  it("locks with score_too_low when approved but below the minimum score", () => {
    const result = checkLessonUnlock({ ...baseInput, bestScore: 50, rules: { minAssignmentScore: 70 } });
    expect(result.unlocked).toBe(false);
    expect(result.reasons).toContain("score_too_low");
  });

  it("does not flag score_too_low when the assignment isn't approved yet", () => {
    const result = checkLessonUnlock({
      ...baseInput,
      assignmentStatus: "draft",
      bestScore: 50,
      rules: { requireAssignmentSubmitted: false, minAssignmentScore: 70 },
    });
    expect(result.reasons).not.toContain("score_too_low");
  });

  it("locks with not_yet_available before the availableAt time", () => {
    const result = checkLessonUnlock({
      ...baseInput,
      availableAt: "2026-06-01T00:00:00Z",
      now: "2026-05-01T00:00:00Z",
    });
    expect(result.unlocked).toBe(false);
    expect(result.reasons).toContain("not_yet_available");
  });

  it("unlocks once availableAt has passed", () => {
    const result = checkLessonUnlock({
      ...baseInput,
      availableAt: "2026-06-01T00:00:00Z",
      now: "2026-07-01T00:00:00Z",
    });
    expect(result.reasons).not.toContain("not_yet_available");
  });

  it("can accumulate multiple lock reasons simultaneously", () => {
    const result = checkLessonUnlock({
      previousLessonApproved: false,
      quizPassed: false,
      assignmentStatus: "submitted",
      bestScore: null,
    });
    expect(result.unlocked).toBe(false);
    expect(result.reasons).toEqual(
      expect.arrayContaining(["previous_lesson_incomplete", "quiz_not_passed", "assignment_pending_review"]),
    );
  });
});

describe("hasWatchedEnough", () => {
  it("returns true when watch percent meets the default 80% threshold", () => {
    expect(hasWatchedEnough(80)).toBe(true);
    expect(hasWatchedEnough(100)).toBe(true);
  });

  it("returns false when watch percent is below the default threshold", () => {
    expect(hasWatchedEnough(79)).toBe(false);
  });

  it("respects a custom threshold", () => {
    expect(hasWatchedEnough(50, 50)).toBe(true);
    expect(hasWatchedEnough(49, 50)).toBe(false);
  });
});
