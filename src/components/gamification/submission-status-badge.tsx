import { Badge } from "@/components/ui/badge";
import { SUBMISSION_STATUS_LABELS_VI, type SubmissionStatus } from "@/features/submissions/status";

const VARIANT_MAP: Record<SubmissionStatus, "neutral" | "royal" | "success" | "warning" | "error"> = {
  draft: "neutral",
  submitted: "royal",
  under_review: "royal",
  revision_requested: "warning",
  resubmitted: "royal",
  approved: "success",
  rejected: "error",
};

export function SubmissionStatusBadge({ status }: { status: SubmissionStatus }) {
  return <Badge variant={VARIANT_MAP[status]}>{SUBMISSION_STATUS_LABELS_VI[status]}</Badge>;
}
