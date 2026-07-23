import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProgressCard } from "@/components/dashboard/progress-card";
import { ScoreDistributionChart } from "@/components/charts/score-distribution-chart";
import { EmptyState } from "@/components/shared/empty-state";
import { getCurrentUser } from "@/lib/auth/session";
import { getTeacherReports } from "@/lib/data/teacher";

export const metadata: Metadata = { title: "Báo cáo", robots: { index: false } };

export default async function TeacherReportsPage() {
  const user = await getCurrentUser();
  const report = await getTeacherReports(user!.id);

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6">
      <PageHeader title="Báo cáo lớp học" breadcrumbs={[{ label: "Tổng quan", href: "/teacher" }, { label: "Báo cáo" }]} />

      <ProgressCard
        title="Tiến độ trung bình các lớp"
        percent={report.averageCompletionPercent}
        description="Trung bình phần trăm bài học đã hoàn thành của học viên"
      />

      <Card>
        <CardHeader>
          <CardTitle>Phân bố điểm bài tập gần nhất</CardTitle>
        </CardHeader>
        <CardContent>
          {report.scoreDistribution.every((b) => b.count === 0) ? (
            <EmptyState title="Chưa có dữ liệu điểm" />
          ) : (
            <ScoreDistributionChart data={report.scoreDistribution} />
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Học viên cần hỗ trợ</CardTitle>
          </CardHeader>
          <CardContent>
            {report.studentsNeedingSupport.length === 0 ? (
              <EmptyState title="Chưa có dữ liệu" />
            ) : (
              <ul className="flex flex-col gap-2 text-sm">
                {report.studentsNeedingSupport.map((s) => (
                  <li key={s.fullName} className="flex justify-between">
                    <span>{s.fullName}</span>
                    <span className="text-muted-foreground">{s.completedLessons} bài hoàn thành</span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Học viên tiến bộ nổi bật</CardTitle>
          </CardHeader>
          <CardContent>
            {report.studentsImproving.length === 0 ? (
              <EmptyState title="Chưa có dữ liệu" />
            ) : (
              <ul className="flex flex-col gap-2 text-sm">
                {report.studentsImproving.map((s) => (
                  <li key={s.fullName} className="flex justify-between">
                    <span>{s.fullName}</span>
                    <span className="text-brand-success">{s.latestScore}/100</span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
