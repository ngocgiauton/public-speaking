import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/layout/page-header";
import { SubmissionStatusBadge } from "@/components/gamification/submission-status-badge";
import { FeedbackPanel } from "@/components/learning/feedback-panel";
import { EmptyState } from "@/components/shared/empty-state";
import { getCurrentUser } from "@/lib/auth/session";
import { getSubmissionById } from "@/lib/data/student";

export const metadata: Metadata = { title: "Kết quả bài nộp", robots: { index: false } };

export default async function SubmissionResultPage({
  params,
}: {
  params: Promise<{ submissionId: string }>;
}) {
  const { submissionId } = await params;
  const user = await getCurrentUser();
  const data = await getSubmissionById(user!.id, submissionId);
  if (!data) notFound();

  const { submission, assignment, lesson, latestReview, scores } = data;

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6">
      <PageHeader
        title={`Kết quả: ${submission.title || assignment.title}`}
        description={`Buổi ${lesson.session_number}: ${lesson.title}`}
        actions={<SubmissionStatusBadge status={submission.status} />}
      />

      {latestReview ? (
        <FeedbackPanel review={latestReview} scores={scores} />
      ) : (
        <EmptyState
          title="Chưa có kết quả"
          description="Giáo viên chưa chấm bài này. Vui lòng quay lại sau."
        />
      )}
    </div>
  );
}
