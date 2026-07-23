import Link from "next/link";
import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/shared/empty-state";
import { getCurrentUser } from "@/lib/auth/session";
import { getParentDashboardSummaries } from "@/lib/data/parent";

export const metadata: Metadata = { title: "Tổng quan", robots: { index: false } };

export default async function ParentDashboardPage() {
  const user = await getCurrentUser();
  const summaries = await getParentDashboardSummaries(user!.id);

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6">
      <PageHeader title={`Chào ${user!.profile.full_name}!`} description="Theo dõi tiến độ học tập của con bạn." />

      {summaries.length === 0 ? (
        <EmptyState
          title="Chưa có học viên nào được liên kết"
          description="Vui lòng liên hệ quản trị viên để liên kết tài khoản với học viên."
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {summaries.map((s) => (
            <Link key={s.profileId} href={`/parent/hoc-vien/${s.profileId}`}>
              <Card className="h-full transition-shadow hover:shadow-md">
                <CardContent className="flex flex-col gap-3 p-5">
                  <div className="flex items-center gap-3">
                    <Avatar name={s.fullName} size={44} />
                    <div>
                      <p className="font-heading font-semibold">{s.fullName}</p>
                      <Badge variant="gold">{s.rankName}</Badge>
                    </div>
                  </div>
                  <Progress value={s.completionPercent} label="Tiến độ khóa học" />
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>{s.completionPercent}% hoàn thành</span>
                    <span>{s.totalXp} XP</span>
                  </div>
                  {(s.pendingReview > 0 || s.needsRevision > 0) && (
                    <div className="flex gap-2 text-xs">
                      {s.pendingReview > 0 && <Badge variant="royal">{s.pendingReview} bài chờ chấm</Badge>}
                      {s.needsRevision > 0 && <Badge variant="warning">{s.needsRevision} cần làm lại</Badge>}
                    </div>
                  )}
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
