import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/layout/page-header";
import { DataTable } from "@/components/shared/data-table";
import { Button } from "@/components/ui/button";
import { SubmissionStatusBadge } from "@/components/gamification/submission-status-badge";
import { formatDateTime } from "@/lib/utils/format";
import { getCurrentUser } from "@/lib/auth/session";
import { getGradingQueue } from "@/lib/data/teacher";
import type { SubmissionStatus } from "@/features/submissions/status";

export const metadata: Metadata = { title: "Bài chờ chấm", robots: { index: false } };

export default async function GradingQueuePage() {
  const user = await getCurrentUser();
  const queue = await getGradingQueue(user!.id);

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6">
      <PageHeader
        title="Bài chờ chấm"
        breadcrumbs={[{ label: "Tổng quan", href: "/teacher" }, { label: "Bài chờ chấm" }]}
      />

      <DataTable
        columns={[
          { key: "student", header: "Học viên", render: (row) => row.studentName },
          {
            key: "assignment",
            header: "Bài tập",
            render: (row) => `Buổi ${row.lessonSessionNumber} · ${row.assignmentTitle}`,
          },
          { key: "attempt", header: "Lần nộp", render: (row) => row.attemptNumber },
          {
            key: "status",
            header: "Trạng thái",
            render: (row) => <SubmissionStatusBadge status={row.status as SubmissionStatus} />,
          },
          {
            key: "submittedAt",
            header: "Nộp lúc",
            render: (row) => (row.submittedAt ? formatDateTime(row.submittedAt) : "—"),
          },
          {
            key: "action",
            header: "",
            render: (row) => (
              <Button asChild size="sm">
                <Link href={`/teacher/cham-bai/${row.submissionId}`}>Chấm bài</Link>
              </Button>
            ),
          },
        ]}
        rows={queue.map((q) => ({ ...q, id: q.submissionId }))}
        emptyTitle="Không có bài nào chờ chấm"
        emptyDescription="Tuyệt vời! Mọi bài nộp đã được xử lý."
      />
    </div>
  );
}
