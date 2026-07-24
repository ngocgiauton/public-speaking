import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SubmissionStatusBadge } from "@/components/gamification/submission-status-badge";
import { FeedbackPanel } from "@/components/learning/feedback-panel";
import { EmptyState } from "@/components/shared/empty-state";
import { getCurrentUser } from "@/lib/auth/session";
import { getSubmissionById } from "@/lib/data/student";
import { createClient } from "@/lib/supabase/server";

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

  const { submission, assignment, lesson, files, latestReview, scores } = data;

  const supabase = await createClient();
  const filesWithUrls = await Promise.all(
    files.map(async (file) => {
      const { data: signed } = await supabase.storage.from("submission-media").createSignedUrl(file.storage_path, 3600);
      return { ...file, signedUrl: signed?.signedUrl ?? null };
    }),
  );

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6">
      <PageHeader
        title={`Kết quả: ${submission.title || assignment.title}`}
        description={`Buổi ${lesson.session_number}: ${lesson.title}`}
        actions={<SubmissionStatusBadge status={submission.status} />}
      />

      {filesWithUrls.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Video đã nộp</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            {filesWithUrls.map((file) =>
              file.signedUrl ? (
                file.file_type === "video" ? (
                  <video
                    key={file.id}
                    src={file.signedUrl}
                    controls
                    className="w-full rounded-[var(--radius-card)]"
                  />
                ) : (
                  <audio key={file.id} src={file.signedUrl} controls className="w-full" />
                )
              ) : (
                <p key={file.id} className="text-sm text-brand-error">
                  Không thể tải file: {file.original_filename}
                </p>
              ),
            )}
          </CardContent>
        </Card>
      )}

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
