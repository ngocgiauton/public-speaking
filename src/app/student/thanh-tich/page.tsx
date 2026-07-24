import type { Metadata } from "next";
import { Flame } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { XPProgress } from "@/components/gamification/xp-progress";
import { RankBadge } from "@/components/gamification/rank-badge";
import { AchievementBadge } from "@/components/gamification/achievement-badge";
import { getCurrentUser } from "@/lib/auth/session";
import { getStudentBadgesOverview, getStudentRank } from "@/lib/data/student";
import { createClient } from "@/lib/supabase/server";
import { RANKS } from "@/config/gamification";
import type { RankSlug } from "@/config/gamification";

export const metadata: Metadata = { title: "Thành tích", robots: { index: false } };

export default async function AchievementsPage() {
  const user = await getCurrentUser();
  const supabase = await createClient();
  const { data: profile } = await supabase
    .from("student_profiles")
    .select("total_xp, current_streak_days")
    .eq("profile_id", user!.id)
    .single();

  const rankSlug = (await getStudentRank(user!.id)) as RankSlug;
  const rankName = RANKS.find((r) => r.slug === rankSlug)?.name ?? "Beginner Speaker";
  const badges = await getStudentBadgesOverview(user!.id);

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6">
      <PageHeader title="Thành tích" breadcrumbs={[{ label: "Tổng quan", href: "/student" }, { label: "Thành tích" }]} />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="font-label-sm text-label-sm uppercase tracking-wide text-on-surface-variant">
              Kinh nghiệm / XP
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <p className="font-heading text-3xl font-bold text-primary">{(profile?.total_xp ?? 0).toLocaleString("vi-VN")}</p>
            <XPProgress totalXp={profile?.total_xp ?? 0} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="font-label-sm text-label-sm uppercase tracking-wide text-on-surface-variant">
              Chuỗi học / Streak
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Flame className="h-8 w-8 text-secondary" aria-hidden="true" />
              <p className="font-heading text-3xl font-bold text-secondary">
                {profile?.current_streak_days ?? 0} <span className="text-base font-medium">ngày</span>
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="flex flex-col items-center justify-center gap-2 bg-inverse-surface p-6 text-center">
          <p className="font-label-sm text-label-sm uppercase tracking-wide text-inverse-on-surface/70">
            Hạng hiện tại / Rank
          </p>
          <RankBadge rankSlug={rankSlug} rankName={rankName} />
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Huy hiệu ({badges.filter((b) => b.awarded).length}/{badges.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {badges.map(({ badge, awarded }) => (
              <AchievementBadge
                key={badge.id}
                name={badge.name}
                description={badge.description ?? undefined}
                icon={badge.icon}
                rarity={badge.rarity}
                awarded={awarded}
              />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
