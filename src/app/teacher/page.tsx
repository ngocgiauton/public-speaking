import Link from "next/link";
import type { Metadata } from "next";
import { GraduationCap, Users, ListChecks } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { StatCard } from "@/components/dashboard/stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/empty-state";
import { getCurrentUser } from "@/lib/auth/session";
import { getTeacherDashboard } from "@/lib/data/teacher";

export const metadata: Metadata = { title: "Tổng quan", robots: { index: false } };

export default async function TeacherDashboardPage() {
  const user = await getCurrentUser();
  const dashboard = await getTeacherDashboard(user!.id);

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6">
      <PageHeader title={`Chào ${user!.profile.full_name}!`} description="Tổng quan hoạt động giảng dạy của bạn." />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Lớp phụ trách" value={dashboard.classCount} icon={GraduationCap} accent="royal" />
        <StatCard label="Học viên" value={dashboard.studentCount} icon={Users} accent="gold" />
        <StatCard label="Bài chờ chấm" value={dashboard.pendingReviewCount} icon={ListChecks} accent="warning" />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Hoạt động cần xử lý</CardTitle>
        </CardHeader>
        <CardContent>
          {dashboard.recentActivity.length === 0 ? (
            <EmptyState title="Không có bài chờ chấm" description="Mọi bài nộp đã được xử lý!" />
          ) : (
            <div className="flex flex-col gap-3">
              {dashboard.recentActivity.map((item) => (
                <div key={item.submissionId} className="flex items-center justify-between gap-3 rounded-[var(--radius-control)] border border-border p-3">
                  <div>
                    <p className="font-medium">{item.studentName}</p>
                    <p className="text-sm text-muted-foreground">
                      Buổi {item.lessonSessionNumber} · {item.assignmentTitle}
                    </p>
                  </div>
                  <Badge variant="warning">Chờ chấm</Badge>
                </div>
              ))}
              <Button asChild variant="outline">
                <Link href="/teacher/bai-cho-cham">Xem tất cả bài chờ chấm</Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
