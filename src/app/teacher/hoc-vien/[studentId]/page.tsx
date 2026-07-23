import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/layout/page-header";
import { SkillScoreCard } from "@/components/dashboard/skill-score-card";
import { XPProgress } from "@/components/gamification/xp-progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable } from "@/components/shared/data-table";
import { SubmissionStatusBadge } from "@/components/gamification/submission-status-badge";
import { UnauthorizedState } from "@/components/shared/error-state";
import { getCurrentUser } from "@/lib/auth/session";
import { verifyTeacherOwnsStudent } from "@/lib/data/teacher";
import { getStudentSkillScores, getStudentSubmissions } from "@/lib/data/student";
import { createClient } from "@/lib/supabase/server";
import type { SubmissionStatus } from "@/features/submissions/status";

export const metadata: Metadata = { title: "Học viên", robots: { index: false } };

export default async function TeacherStudentDetailPage({
  params,
}: {
  params: Promise<{ studentId: string }>;
}) {
  const { studentId } = await params;
  const user = await getCurrentUser();

  const isOwner = await verifyTeacherOwnsStudent(user!.id, studentId);
  if (!isOwner) return <UnauthorizedState />;

  const supabase = await createClient();
  const { data: profile } = await supabase.from("profiles").select("full_name").eq("id", studentId).maybeSingle();
  if (!profile) notFound();

  const { data: studentProfile } = await supabase
    .from("student_profiles")
    .select("total_xp")
    .eq("profile_id", studentId)
    .single();

  const [skillScores, submissions] = await Promise.all([
    getStudentSkillScores(studentId),
    getStudentSubmissions(studentId),
  ]);

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      <PageHeader title={profile.full_name} breadcrumbs={[{ label: "Lớp học", href: "/teacher/lop-hoc" }, { label: profile.full_name }]} />

      <Card>
        <CardHeader>
          <CardTitle>Điểm kinh nghiệm</CardTitle>
        </CardHeader>
        <CardContent>
          <XPProgress totalXp={studentProfile?.total_xp ?? 0} />
        </CardContent>
      </Card>

      <SkillScoreCard scores={skillScores} />

      <Card>
        <CardHeader>
          <CardTitle>Lịch sử bài nộp</CardTitle>
        </CardHeader>
        <CardContent>
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
        </CardContent>
      </Card>
    </div>
  );
}
