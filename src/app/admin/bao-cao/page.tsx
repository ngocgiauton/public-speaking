import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatCard } from "@/components/dashboard/stat-card";
import { ScoreDistributionChart } from "@/components/charts/score-distribution-chart";
import { Clock } from "lucide-react";
import { getAdminReports, getAdminDashboardStats } from "@/lib/data/admin";

export const metadata: Metadata = { title: "Báo cáo tổng hợp", robots: { index: false } };

export default async function AdminReportsPage() {
  const [report, stats] = await Promise.all([getAdminReports(), getAdminDashboardStats()]);

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6">
      <PageHeader title="Báo cáo tổng hợp" breadcrumbs={[{ label: "Tổng quan", href: "/admin" }, { label: "Báo cáo" }]} />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Tỷ lệ hoàn thành bài" value={`${stats.completionRate}%`} icon={Clock} accent="success" />
        <StatCard
          label="Thời gian chấm bài trung bình"
          value={report.averageGradingHours != null ? `${report.averageGradingHours}h` : "Chưa có dữ liệu"}
          icon={Clock}
          accent="royal"
        />
        <StatCard label="Lượt đăng ký tư vấn" value={stats.leadCount} icon={Clock} accent="gold" />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Đăng ký tư vấn theo trạng thái</CardTitle>
        </CardHeader>
        <CardContent>
          <ScoreDistributionChart data={report.leadsByStatus} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Bài nộp theo trạng thái</CardTitle>
        </CardHeader>
        <CardContent>
          <ScoreDistributionChart data={report.submissionsByStatus} />
        </CardContent>
      </Card>
    </div>
  );
}
