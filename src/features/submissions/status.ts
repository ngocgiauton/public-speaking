export type SubmissionStatus =
  | "draft"
  | "submitted"
  | "under_review"
  | "revision_requested"
  | "resubmitted"
  | "approved"
  | "rejected";

export const SUBMISSION_STATUS_LABELS_VI: Record<SubmissionStatus, string> = {
  draft: "Bản nháp",
  submitted: "Đã nộp",
  under_review: "Đang chấm",
  revision_requested: "Cần làm lại",
  resubmitted: "Đã nộp lại",
  approved: "Đã đạt",
  rejected: "Chưa đạt",
};

const ALLOWED_TRANSITIONS: Record<SubmissionStatus, SubmissionStatus[]> = {
  draft: ["submitted"],
  submitted: ["under_review"],
  under_review: ["revision_requested", "approved", "rejected"],
  revision_requested: ["resubmitted"],
  resubmitted: ["under_review"],
  approved: [],
  rejected: ["resubmitted"],
};

export function canTransitionSubmission(
  from: SubmissionStatus,
  to: SubmissionStatus,
): boolean {
  return ALLOWED_TRANSITIONS[from]?.includes(to) ?? false;
}

export function isEditableByStudent(status: SubmissionStatus): boolean {
  return status === "draft" || status === "revision_requested" || status === "rejected";
}
