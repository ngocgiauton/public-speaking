import { RANKS, XP_RULES, type RankDefinition } from "@/config/gamification";

export function getRankForXp(totalXp: number): RankDefinition {
  let current = RANKS[0];
  for (const rank of RANKS) {
    if (totalXp >= rank.minXp) {
      current = rank;
    } else {
      break;
    }
  }
  return current;
}

export function getNextRank(totalXp: number): RankDefinition | null {
  const current = getRankForXp(totalXp);
  const currentIndex = RANKS.findIndex((r) => r.slug === current.slug);
  return RANKS[currentIndex + 1] ?? null;
}

export function getXpToNextRank(totalXp: number): number {
  const next = getNextRank(totalXp);
  if (!next) return 0;
  return Math.max(next.minXp - totalXp, 0);
}

export function getRankProgressPercent(totalXp: number): number {
  const current = getRankForXp(totalXp);
  const next = getNextRank(totalXp);
  if (!next) return 100;
  const span = next.minXp - current.minXp;
  if (span <= 0) return 100;
  const progressed = totalXp - current.minXp;
  return Math.min(100, Math.max(0, Math.round((progressed / span) * 100)));
}

export interface AssignmentXpInput {
  score: number;
  dueAt?: string | Date | null;
  submittedAt: string | Date;
  previousBestScore?: number | null;
}

export interface XpAward {
  reason:
    | "assignment_complete"
    | "score_bonus"
    | "on_time_bonus"
    | "improvement_bonus";
  amount: number;
}

/** Tính danh sách XP được cộng khi một bài tập được duyệt (Approved). */
export function computeAssignmentApprovalXp(
  input: AssignmentXpInput,
): XpAward[] {
  const awards: XpAward[] = [
    { reason: "assignment_complete", amount: XP_RULES.assignmentComplete },
  ];

  if (input.score >= XP_RULES.scoreBonusThreshold) {
    awards.push({ reason: "score_bonus", amount: XP_RULES.scoreBonus });
  }

  if (input.dueAt) {
    const due = new Date(input.dueAt);
    const submitted = new Date(input.submittedAt);
    if (submitted.getTime() <= due.getTime()) {
      awards.push({ reason: "on_time_bonus", amount: XP_RULES.onTimeBonus });
    }
  }

  if (
    typeof input.previousBestScore === "number" &&
    input.score - input.previousBestScore >= XP_RULES.improvementMinDelta
  ) {
    awards.push({
      reason: "improvement_bonus",
      amount: XP_RULES.improvementBonus,
    });
  }

  return awards;
}

export function sumXpAwards(awards: XpAward[]): number {
  return awards.reduce((sum, award) => sum + award.amount, 0);
}

export function getStreakBonusXp(streakDays: number): number {
  if (streakDays > 0 && streakDays % 7 === 0) return XP_RULES.streak7Days;
  if (streakDays > 0 && streakDays % 3 === 0) return XP_RULES.streak3Days;
  return 0;
}
