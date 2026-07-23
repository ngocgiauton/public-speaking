import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { XPProgress } from "@/components/gamification/xp-progress";
import { SkillScoreCard } from "@/components/dashboard/skill-score-card";
import { AchievementBadge } from "@/components/gamification/achievement-badge";
import { UnauthorizedState } from "@/components/shared/error-state";
import { getCurrentUser } from "@/lib/auth/session";
import { verifyParentOwnsStudent } from "@/lib/data/parent";
import { getStudentBadgesOverview, getStudentDashboard } from "@/lib/data/student";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Học viên", robots: { index: false } };

export default async function ParentStudentDetailPage({
  params,
}: {
  params: Promise<{ studentId: string }>;
}) {
  const { studentId } = await params;
  const user = await getCurrentUser();

  const isOwner = await verifyParentOwnsStudent(user!.id, studentId);
  if (!isOwner) return <UnauthorizedState />;

  const supabase = await createClient();
  const { data: profile } = await supabase.from("profiles").select("full_name").eq("id", studentId).maybeSingle();
  if (!profile) notFound();

  const dashboard = await getStudentDashboard(studentId);
  const badges = await getStudentBadgesOverview(studentId);
  const earnedBadges = badges.filter((b) => b.awarded);

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      <PageHeader
        title={profile.full_name}
        breadcrumbs={[{ label: "Tổng quan", href: "/parent" }, { label: profile.full_name }]}
        actions={
          <div className="flex gap-2">
            <Button asChild variant="outline" size="sm">
              <Link href={`/parent/tien-do/${studentId}`}>Tiến độ</Link>
            </Button>
            <Button asChild variant="outline" size="sm">
              <Link href={`/parent/bai-tap/${studentId}`}>Bài tập</Link>
            </Button>
            <Button asChild size="sm">
              <Link href={`/parent/bao-cao/${studentId}`}>Báo cáo</Link>
            </Button>
          </div>
        }
      />

      <Card>
        <CardHeader>
          <CardTitle>Điểm kinh nghiệm &amp; Rank</CardTitle>
        </CardHeader>
        <CardContent>
          <XPProgress totalXp={dashboard.totalXp} />
        </CardContent>
      </Card>

      <SkillScoreCard scores={dashboard.skillScores} />

      <Card>
        <CardHeader>
          <CardTitle>Huy hiệu đã đạt ({earnedBadges.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {earnedBadges.map(({ badge }) => (
              <AchievementBadge key={badge.id} name={badge.name} icon={badge.icon} rarity={badge.rarity} awarded />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
