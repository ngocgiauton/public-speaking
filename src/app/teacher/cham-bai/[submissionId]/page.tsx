import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SubmissionStatusBadge } from "@/components/gamification/submission-status-badge";
import { UnauthorizedState } from "@/components/shared/error-state";
import { RubricScoreForm } from "@/components/learning/rubric-score-form";
import { formatDateTime } from "@/lib/utils/format";
import { getCurrentUser } from "@/lib/auth/session";
import { getSubmissionForGrading, verifyTeacherOwnsStudent } from "@/lib/data/teacher";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Chấm bài", robots: { index: false } };

export default async function GradeSubmissionPage({
  params,
}: {
  params: Promise<{ submissionId: string }>;
}) {
  const { submissionId } = await params;
  const user = await getCurrentUser();

  const context = await getSubmissionForGrading(submissionId);
  if (!context) notFound();

  const isOwner = await verifyTeacherOwnsStudent(user!.id, context.submission.student_profile_id);
  if (!isOwner) return <UnauthorizedState />;

  const supabase = await createClient();
  const filesWithUrls = await Promise.all(
    context.files.map(async (file) => {
      const { data } = await supabase.storage.from("submission-media").createSignedUrl(file.storage_path, 3600);
      return { ...file, signedUrl: data?.signedUrl ?? null };
    }),
  );

  const canGrade = ["submitted", "under_review", "resubmitted"].includes(context.submission.status);

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      <PageHeader
        title={`Chấm bài: ${context.student.fullName}`}
        description={`Buổi ${context.lesson.session_number} · ${context.assignment.title}`}
        breadcrumbs={[{ label: "Bài chờ chấm", href: "/teacher/bai-cho-cham" }, { label: "Chấm bài" }]}
        actions={<SubmissionStatusBadge status={context.submission.status} />}
      />

      <Card>
        <CardHeader>
          <CardTitle>Video/âm thanh đã nộp</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {filesWithUrls.length === 0 && <p className="text-sm text-muted-foreground">Chưa có file nào.</p>}
          {filesWithUrls.map((file) =>
            file.signedUrl ? (
              file.file_type === "video" ? (
                <video key={file.id} src={file.signedUrl} controls className="w-full rounded-[var(--radius-card)]" />
              ) : (
                <audio key={file.id} src={file.signedUrl} controls className="w-full" />
              )
            ) : (
              <p key={file.id} className="text-sm text-brand-error">
                Không thể tải file: {file.original_filename}
              </p>
            ),
          )}
          {context.submission.notes && (
            <p className="text-sm text-muted-foreground">Ghi chú của học viên: {context.submission.notes}</p>
          )}
        </CardContent>
      </Card>

      {context.reviewHistory.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Lịch sử các lần chấm</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {context.reviewHistory.map((r) => (
              <div key={r.id} className="rounded-[var(--radius-control)] border border-border p-3 text-sm">
                <div className="flex items-center justify-between">
                  <Badge variant={r.decision === "approved" ? "success" : "warning"}>{r.decision}</Badge>
                  <span className="text-muted-foreground">{formatDateTime(r.reviewed_at)}</span>
                </div>
                {r.overall_comment && <p className="mt-1 text-muted-foreground">{r.overall_comment}</p>}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {canGrade ? (
        <Card>
          <CardHeader>
            <CardTitle>Chấm điểm theo rubric</CardTitle>
          </CardHeader>
          <CardContent>
            <RubricScoreForm submissionId={submissionId} criteria={context.rubricCriteria} />
          </CardContent>
        </Card>
      ) : (
        <p className="text-sm text-muted-foreground">Bài này đã được chấm xong.</p>
      )}
    </div>
  );
}
