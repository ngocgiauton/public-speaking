import Link from "next/link";
import type { Metadata } from "next";
import { BookOpenCheck, Flame, ClipboardList, RotateCcw } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { StatCard } from "@/components/dashboard/stat-card";
import { ProgressCard } from "@/components/dashboard/progress-card";
import { SkillScoreCard } from "@/components/dashboard/skill-score-card";
import { XPProgress } from "@/components/gamification/xp-progress";
import { AchievementBadge } from "@/components/gamification/achievement-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/empty-state";
import { getCurrentUser } from "@/lib/auth/session";
import { getStudentDashboard } from "@/lib/data/student";

export const metadata: Metadata = { title: "Tổng quan", robots: { index: false } };

export default async function StudentDashboardPage() {
  const user = await getCurrentUser();
  const dashboard = await getStudentDashboard(user!.id);

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6">
      <PageHeader
        title={`Chào ${user!.profile.full_name}!`}
        description="Cùng tiếp tục hành trình Speak to Lead của bạn nhé."
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Chuỗi ngày học" value={`${dashboard.currentStreak} ngày`} icon={Flame} accent="gold" />
        <StatCard label="Bài chờ chấm" value={dashboard.pendingReview} icon={ClipboardList} accent="royal" />
        <StatCard label="Cần làm lại" value={dashboard.needsRevision} icon={RotateCcw} accent="warning" />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="flex flex-col gap-6 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Xếp hạng &amp; Điểm kinh nghiệm</CardTitle>
            </CardHeader>
            <CardContent>
              <XPProgress totalXp={dashboard.totalXp} />
            </CardContent>
          </Card>

          <ProgressCard
            title="Tiến độ khóa học"
            percent={dashboard.completionPercent}
            description="Phần trăm bài học đã hoàn thành"
          />

          {dashboard.nextLesson ? (
            <Card>
              <CardHeader>
                <CardTitle>Bài học tiếp theo</CardTitle>
              </CardHeader>
              <CardContent className="flex items-center justify-between gap-4">
                <div>
                  <p className="font-heading font-semibold">
                    Buổi {dashboard.nextLesson.lesson.session_number}: {dashboard.nextLesson.lesson.title}
                  </p>
                  <p className="text-sm text-muted-foreground">{dashboard.nextLesson.lesson.short_description}</p>
                </div>
                <Button asChild>
                  <Link href={`/student/bai-hoc/${dashboard.nextLesson.lesson.id}`}>Tiếp tục học</Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <EmptyState
              icon={BookOpenCheck}
              title="Bạn đã hoàn thành mọi bài học hiện có!"
              description="Hãy chờ bài học mới hoặc ghé Phòng luyện tập để trau dồi thêm kỹ năng."
            />
          )}

          <SkillScoreCard scores={dashboard.skillScores} />
        </div>

        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Huy hiệu mới nhất</CardTitle>
            </CardHeader>
            <CardContent>
              {dashboard.recentBadges.length === 0 ? (
                <EmptyState title="Chưa có huy hiệu" description="Hoàn thành bài học đầu tiên để nhận huy hiệu!" />
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  {dashboard.recentBadges.map((badge) => (
                    <AchievementBadge
                      key={badge.name}
                      name={badge.name}
                      icon={badge.icon}
                      rarity={badge.rarity as "common" | "rare" | "epic" | "legendary"}
                      awarded
                    />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
