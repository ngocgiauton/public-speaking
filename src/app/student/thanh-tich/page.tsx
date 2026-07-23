import type { Metadata } from "next";
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
    .select("total_xp")
    .eq("profile_id", user!.id)
    .single();

  const rankSlug = (await getStudentRank(user!.id)) as RankSlug;
  const rankName = RANKS.find((r) => r.slug === rankSlug)?.name ?? "Beginner Speaker";
  const badges = await getStudentBadgesOverview(user!.id);

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6">
      <PageHeader title="Thành tích" breadcrumbs={[{ label: "Tổng quan", href: "/student" }, { label: "Thành tích" }]} />

      <Card>
        <CardHeader>
          <CardTitle>Rank thành tích hiện tại</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <RankBadge rankSlug={rankSlug} rankName={rankName} />
          <XPProgress totalXp={profile?.total_xp ?? 0} />
        </CardContent>
      </Card>

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
