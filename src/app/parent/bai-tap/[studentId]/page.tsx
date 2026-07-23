import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/page-header";
import { DataTable } from "@/components/shared/data-table";
import { SubmissionStatusBadge } from "@/components/gamification/submission-status-badge";
import { UnauthorizedState } from "@/components/shared/error-state";
import { getCurrentUser } from "@/lib/auth/session";
import { verifyParentOwnsStudent } from "@/lib/data/parent";
import { getStudentSubmissions } from "@/lib/data/student";
import { createClient } from "@/lib/supabase/server";
import type { SubmissionStatus } from "@/features/submissions/status";

export const metadata: Metadata = { title: "Bài tập của học viên", robots: { index: false } };

export default async function ParentStudentAssignmentsPage({
  params,
}: {
  params: Promise<{ studentId: string }>;
}) {
  const { studentId } = await params;
  const user = await getCurrentUser();

  const isOwner = await verifyParentOwnsStudent(user!.id, studentId);
  if (!isOwner) return <UnauthorizedState />;

  const supabase = await createClient();
  const { data: profile } = await supabase.from("profiles").select("full_name").eq("id", studentId).single();
  const submissions = await getStudentSubmissions(studentId);

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      <PageHeader
        title={`Bài tập của ${profile?.full_name ?? ""}`}
        breadcrumbs={[{ label: "Tổng quan", href: "/parent" }, { label: "Bài tập" }]}
      />

      <DataTable
        columns={[
          { key: "lesson", header: "Buổi", render: (row) => row.lesson_session_number },
          { key: "assignment", header: "Bài tập", render: (row) => row.assignment_title },
          {
            key: "status",
            header: "Trạng thái",
            render: (row) => <SubmissionStatusBadge status={row.status as SubmissionStatus} />,
          },
          { key: "score", header: "Điểm", render: (row) => (row.best_score != null ? `${row.best_score}/100` : "—") },
        ]}
        rows={submissions}
        emptyTitle="Chưa có bài nộp nào"
      />
    </div>
  );
}
