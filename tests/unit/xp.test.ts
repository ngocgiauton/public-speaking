import { describe, expect, it } from "vitest";
import {
  computeAssignmentApprovalXp,
  getNextRank,
  getRankForXp,
  getRankProgressPercent,
  getStreakBonusXp,
  getXpToNextRank,
  sumXpAwards,
} from "@/features/xp/xp";
import { XP_RULES } from "@/config/gamification";

describe("getRankForXp", () => {
  it("returns Beginner Speaker at 0 XP", () => {
    expect(getRankForXp(0).slug).toBe("beginner-speaker");
  });

  it("returns the exact-match rank at its threshold", () => {
    expect(getRankForXp(150).slug).toBe("bronze-speaker");
    expect(getRankForXp(2200).slug).toBe("royal-speaker");
  });

  it("returns the highest rank not exceeded", () => {
    expect(getRankForXp(149).slug).toBe("beginner-speaker");
    expect(getRankForXp(3199).slug).toBe("royal-speaker");
  });

  it("returns Master Speaker for very high XP", () => {
    expect(getRankForXp(999999).slug).toBe("master-speaker");
  });
});

describe("getNextRank / getXpToNextRank / getRankProgressPercent", () => {
  it("computes the next rank and remaining XP", () => {
    expect(getNextRank(0)?.slug).toBe("bronze-speaker");
    expect(getXpToNextRank(0)).toBe(150);
  });

  it("returns null next rank and 100% progress at max rank", () => {
    expect(getNextRank(3200)).toBeNull();
    expect(getXpToNextRank(3200)).toBe(0);
    expect(getRankProgressPercent(3200)).toBe(100);
  });

  it("computes progress percent within a rank band", () => {
    // beginner-speaker: 0-149, bronze-speaker starts at 150
    expect(getRankProgressPercent(75)).toBe(50);
  });
});

describe("computeAssignmentApprovalXp", () => {
  it("always awards the base assignment_complete XP", () => {
    const awards = computeAssignmentApprovalXp({
      score: 50,
      submittedAt: "2026-01-01T00:00:00Z",
    });
    expect(awards).toEqual([{ reason: "assignment_complete", amount: XP_RULES.assignmentComplete }]);
  });

  it("adds a score bonus at or above the threshold", () => {
    const awards = computeAssignmentApprovalXp({
      score: 90,
      submittedAt: "2026-01-01T00:00:00Z",
    });
    expect(awards).toContainEqual({ reason: "score_bonus", amount: XP_RULES.scoreBonus });
  });

  it("does not add a score bonus just below the threshold", () => {
    const awards = computeAssignmentApprovalXp({
      score: 84,
      submittedAt: "2026-01-01T00:00:00Z",
    });
    expect(awards).not.toContainEqual(expect.objectContaining({ reason: "score_bonus" }));
  });

  it("adds an on-time bonus when submitted before the due date", () => {
    const awards = computeAssignmentApprovalXp({
      score: 50,
      dueAt: "2026-01-10T00:00:00Z",
      submittedAt: "2026-01-05T00:00:00Z",
    });
    expect(awards).toContainEqual({ reason: "on_time_bonus", amount: XP_RULES.onTimeBonus });
  });

  it("does not add an on-time bonus when submitted after the due date", () => {
    const awards = computeAssignmentApprovalXp({
      score: 50,
      dueAt: "2026-01-01T00:00:00Z",
      submittedAt: "2026-01-05T00:00:00Z",
    });
    expect(awards).not.toContainEqual(expect.objectContaining({ reason: "on_time_bonus" }));
  });

  it("adds an improvement bonus when score improves by at least the minimum delta", () => {
    const awards = computeAssignmentApprovalXp({
      score: 80,
      submittedAt: "2026-01-01T00:00:00Z",
      previousBestScore: 65,
    });
    expect(awards).toContainEqual({ reason: "improvement_bonus", amount: XP_RULES.improvementBonus });
  });

  it("does not add an improvement bonus for a smaller improvement", () => {
    const awards = computeAssignmentApprovalXp({
      score: 70,
      submittedAt: "2026-01-01T00:00:00Z",
      previousBestScore: 65,
    });
    expect(awards).not.toContainEqual(expect.objectContaining({ reason: "improvement_bonus" }));
  });

  it("stacks multiple bonuses together", () => {
    const awards = computeAssignmentApprovalXp({
      score: 95,
      dueAt: "2026-01-10T00:00:00Z",
      submittedAt: "2026-01-05T00:00:00Z",
      previousBestScore: 70,
    });
    expect(awards).toHaveLength(4);
    expect(sumXpAwards(awards)).toBe(
      XP_RULES.assignmentComplete + XP_RULES.scoreBonus + XP_RULES.onTimeBonus + XP_RULES.improvementBonus,
    );
  });
});

describe("getStreakBonusXp", () => {
  it("returns 0 for non-milestone streak lengths", () => {
    expect(getStreakBonusXp(1)).toBe(0);
    expect(getStreakBonusXp(2)).toBe(0);
    expect(getStreakBonusXp(4)).toBe(0);
  });

  it("returns the 3-day bonus at day 3", () => {
    expect(getStreakBonusXp(3)).toBe(XP_RULES.streak3Days);
  });

  it("returns the 7-day bonus at day 7 (takes precedence over the 3-day rule)", () => {
    expect(getStreakBonusXp(7)).toBe(XP_RULES.streak7Days);
  });

  it("returns 0 for streak 0", () => {
    expect(getStreakBonusXp(0)).toBe(0);
  });
});
