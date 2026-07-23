import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProgressCard } from "@/components/dashboard/progress-card";
import { SkillScoreCard } from "@/components/dashboard/skill-score-card";
import { NotificationsList } from "@/components/dashboard/notifications-list";
import { UnauthorizedState } from "@/components/shared/error-state";
import { getCurrentUser } from "@/lib/auth/session";
import { verifyParentOwnsStudent } from "@/lib/data/parent";
import { getStudentDashboard } from "@/lib/data/student";
import { getNotificationsForProfile } from "@/lib/data/notifications";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Báo cáo tiến bộ", robots: { index: false } };

export default async function ParentStudentReportPage({
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
  const dashboard = await getStudentDashboard(studentId);
  const notifications = (await getNotificationsForProfile(studentId)).slice(0, 5);

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      <PageHeader
        title={`Báo cáo tiến bộ: ${profile?.full_name ?? ""}`}
        breadcrumbs={[{ label: "Tổng quan", href: "/parent" }, { label: "Báo cáo" }]}
      />

      <ProgressCard
        title="Tiến độ khóa học"
        percent={dashboard.completionPercent}
        description={`${dashboard.rankName} · ${dashboard.totalXp} XP`}
      />

      <SkillScoreCard scores={dashboard.skillScores} />

      <Card>
        <CardHeader>
          <CardTitle>Phản hồi &amp; thông báo gần đây</CardTitle>
        </CardHeader>
        <CardContent>
          <NotificationsList notifications={notifications} />
        </CardContent>
      </Card>
    </div>
  );
}
