import { describe, expect, it } from "vitest";
import {
  getRubricMaxForCriteria,
  getRubricMaxTotal,
  normalizeRubricScoreTo100,
  sumRubricScore,
  validateRubricScores,
} from "@/features/reviews/rubric";

describe("sumRubricScore", () => {
  it("sums scores across criteria", () => {
    expect(sumRubricScore({ eye_contact: 5, posture: 4 })).toBe(9);
  });

  it("returns 0 for an empty score map", () => {
    expect(sumRubricScore({})).toBe(0);
  });
});

describe("validateRubricScores", () => {
  it("accepts valid scores within each criterion's max", () => {
    expect(validateRubricScores({ eye_contact: 5, posture: 3 })).toEqual([]);
  });

  it("rejects a score above the criterion's max", () => {
    const errors = validateRubricScores({ eye_contact: 6 });
    expect(errors).toHaveLength(1);
    expect(errors[0].criterionKey).toBe("eye_contact");
  });

  it("rejects a negative score", () => {
    const errors = validateRubricScores({ eye_contact: -1 });
    expect(errors.some((e) => e.criterionKey === "eye_contact")).toBe(true);
  });

  it("rejects an unknown criterion key", () => {
    const errors = validateRubricScores({ not_a_real_criterion: 3 });
    expect(errors).toHaveLength(1);
  });
});

describe("getRubricMaxForCriteria / getRubricMaxTotal", () => {
  it("sums max scores for a subset of criteria", () => {
    // eye_contact + posture = 5 + 5 = 10 (body_language group)
    expect(getRubricMaxForCriteria(["eye_contact", "posture"])).toBe(10);
  });

  it("returns 0 for an empty list", () => {
    expect(getRubricMaxForCriteria([])).toBe(0);
  });

  it("the full rubric totals 100 points", () => {
    expect(getRubricMaxTotal()).toBe(100);
  });
});

describe("normalizeRubricScoreTo100", () => {
  it("scales a partial-rubric score up to a 100-point scale", () => {
    // eye_contact(5) + posture(5) = max 10; scoring 9/10 -> 90/100
    const result = normalizeRubricScoreTo100({ eye_contact: 5, posture: 4 }, ["eye_contact", "posture"]);
    expect(result).toBe(90);
  });

  it("returns 0 when the criteria list is empty", () => {
    expect(normalizeRubricScoreTo100({}, [])).toBe(0);
  });

  it("returns 100 for a perfect score", () => {
    const result = normalizeRubricScoreTo100({ eye_contact: 5, posture: 5 }, ["eye_contact", "posture"]);
    expect(result).toBe(100);
  });
});
