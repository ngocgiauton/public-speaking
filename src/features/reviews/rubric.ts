import { RUBRIC_GROUPS, RUBRIC_MAX_TOTAL } from "@/config/gamification";

export type RubricCriterionKey = string;

export interface RubricScoreMap {
  [criterionKey: string]: number;
}

const CRITERION_MAX_LOOKUP: Record<string, number> = RUBRIC_GROUPS.reduce(
  (acc, group) => {
    for (const criterion of group.criteria) {
      acc[criterion.key] = criterion.maxScore;
    }
    return acc;
  },
  {} as Record<string, number>,
);

export interface RubricValidationError {
  criterionKey: string;
  message: string;
}

/**
 * Xác thực điểm rubric: mỗi tiêu chí không vượt điểm tối đa, không âm.
 * Chỉ những tiêu chí được truyền vào (assignment có thể chọn tập con) mới
 * được tính.
 */
export function validateRubricScores(
  scores: RubricScoreMap,
): RubricValidationError[] {
  const errors: RubricValidationError[] = [];

  for (const [key, value] of Object.entries(scores)) {
    const max = CRITERION_MAX_LOOKUP[key];
    if (max === undefined) {
      errors.push({ criterionKey: key, message: "Tiêu chí không hợp lệ" });
      continue;
    }
    if (value < 0) {
      errors.push({ criterionKey: key, message: "Điểm không được âm" });
    }
    if (value > max) {
      errors.push({
        criterionKey: key,
        message: `Điểm không được vượt quá ${max}`,
      });
    }
  }

  return errors;
}

export function sumRubricScore(scores: RubricScoreMap): number {
  return Object.values(scores).reduce((sum, value) => sum + value, 0);
}

export function getRubricMaxForCriteria(criterionKeys: string[]): number {
  return criterionKeys.reduce(
    (sum, key) => sum + (CRITERION_MAX_LOOKUP[key] ?? 0),
    0,
  );
}

export function getRubricMaxTotal(): number {
  return RUBRIC_MAX_TOTAL;
}

/** Chuẩn hoá điểm rubric về thang 100 khi assignment chỉ dùng một phần tiêu chí. */
export function normalizeRubricScoreTo100(
  scores: RubricScoreMap,
  criterionKeys: string[],
): number {
  const max = getRubricMaxForCriteria(criterionKeys);
  if (max === 0) return 0;
  const total = sumRubricScore(scores);
  return Math.round((total / max) * 100);
}
