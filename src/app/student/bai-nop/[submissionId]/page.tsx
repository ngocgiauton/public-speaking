import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SubmissionStatusBadge } from "@/components/gamification/submission-status-badge";
import { Button } from "@/components/ui/button";
import { formatDateTime } from "@/lib/utils/format";
import { getCurrentUser } from "@/lib/auth/session";
import { getSubmissionById } from "@/lib/data/student";

export const metadata: Metadata = { title: "Bài nộp", robots: { index: false } };

export default async function SubmissionDetailPage({
  params,
}: {
  params: Promise<{ submissionId: string }>;
}) {
  const { submissionId } = await params;
  const user = await getCurrentUser();
  const data = await getSubmissionById(user!.id, submissionId);
  if (!data) notFound();

  const { submission, assignment, lesson, files } = data;

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6">
      <PageHeader
        title={submission.title || assignment.title}
        description={`Buổi ${lesson.session_number}: ${lesson.title}`}
        actions={<SubmissionStatusBadge status={submission.status} />}
      />

      <Card>
        <CardHeader>
          <CardTitle>Thông tin bài nộp</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-2 text-sm">
          <p>
            <span className="text-muted-foreground">Lần nộp:</span> {submission.attempt_number}
          </p>
          {submission.submitted_at && (
            <p>
              <span className="text-muted-foreground">Nộp lúc:</span> {formatDateTime(submission.submitted_at)}
            </p>
          )}
          {submission.notes && (
            <p>
              <span className="text-muted-foreground">Ghi chú:</span> {submission.notes}
            </p>
          )}
          <p className="text-muted-foreground">{files.length} file đã tải lên</p>
        </CardContent>
      </Card>

      <div className="flex gap-3">
        <Button asChild variant="outline">
          <Link href={`/student/bai-tap/${assignment.id}`}>Xem bài tập</Link>
        </Button>
        <Button asChild>
          <Link href={`/student/ket-qua/${submission.id}`}>Xem kết quả</Link>
        </Button>
      </div>
    </div>
  );
}
