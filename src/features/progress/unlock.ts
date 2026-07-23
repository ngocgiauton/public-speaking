import { DEFAULT_UNLOCK_RULES } from "@/config/gamification";

export type LockReason =
  | "previous_lesson_incomplete"
  | "quiz_not_passed"
  | "assignment_pending_review"
  | "score_too_low"
  | "not_yet_available";

export const LOCK_REASON_LABELS_VI: Record<LockReason, string> = {
  previous_lesson_incomplete: "Chưa hoàn thành bài trước",
  quiz_not_passed: "Chưa đạt quiz",
  assignment_pending_review: "Bài tập đang chờ giáo viên duyệt",
  score_too_low: "Chưa đủ điểm",
  not_yet_available: "Chưa đến thời gian mở bài",
};

export interface UnlockCheckInput {
  previousLessonApproved: boolean | null;
  quizPassed: boolean | null;
  assignmentStatus:
    | "not_submitted"
    | "draft"
    | "submitted"
    | "under_review"
    | "revision_requested"
    | "resubmitted"
    | "approved"
    | "rejected";
  bestScore: number | null;
  availableAt?: string | Date | null;
  now?: string | Date;
  rules?: Partial<typeof DEFAULT_UNLOCK_RULES>;
}

export interface UnlockResult {
  unlocked: boolean;
  reasons: LockReason[];
}

export function checkLessonUnlock(input: UnlockCheckInput): UnlockResult {
  const rules = { ...DEFAULT_UNLOCK_RULES, ...input.rules };
  const reasons: LockReason[] = [];

  if (rules.requirePreviousApproved && input.previousLessonApproved === false) {
    reasons.push("previous_lesson_incomplete");
  }

  if (input.availableAt) {
    const now = input.now ? new Date(input.now) : new Date();
    if (now.getTime() < new Date(input.availableAt).getTime()) {
      reasons.push("not_yet_available");
    }
  }

  if (rules.requireQuizPass && input.quizPassed === false) {
    reasons.push("quiz_not_passed");
  }

  if (
    rules.requireAssignmentSubmitted &&
    (input.assignmentStatus === "submitted" ||
      input.assignmentStatus === "under_review" ||
      input.assignmentStatus === "resubmitted")
  ) {
    reasons.push("assignment_pending_review");
  }

  if (
    rules.minAssignmentScore != null &&
    input.assignmentStatus === "approved" &&
    typeof input.bestScore === "number" &&
    input.bestScore < rules.minAssignmentScore
  ) {
    reasons.push("score_too_low");
  }

  return { unlocked: reasons.length === 0, reasons };
}

export function hasWatchedEnough(
  watchPercent: number,
  minPercent: number = DEFAULT_UNLOCK_RULES.minVideoWatchPercent,
): boolean {
  return watchPercent >= minPercent;
}
