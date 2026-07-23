import Link from "next/link";
import type { Metadata } from "next";
import { Users, GraduationCap, School, TrendingUp, ClipboardList, MessageSquare } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { StatCard } from "@/components/dashboard/stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getAdminDashboardStats } from "@/lib/data/admin";

export const metadata: Metadata = { title: "Tổng quan quản trị", robots: { index: false } };

export default async function AdminDashboardPage() {
  const stats = await getAdminDashboardStats();

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6">
      <PageHeader title="Tổng quan quản trị" description="Số liệu vận hành toàn bộ nền tảng." />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Tổng người dùng" value={stats.totalUsers} icon={Users} accent="royal" />
        <StatCard label="Học viên hoạt động" value={stats.activeStudents} icon={GraduationCap} accent="success" />
        <StatCard label="Giáo viên" value={stats.teacherCount} icon={Users} accent="gold" />
        <StatCard label="Lớp đang học" value={stats.activeClasses} icon={School} accent="royal" />
        <StatCard label="Tỷ lệ hoàn thành bài" value={`${stats.completionRate}%`} icon={TrendingUp} accent="success" />
        <StatCard label="Bài chờ chấm" value={stats.pendingReviewCount} icon={ClipboardList} accent="warning" />
        <StatCard label="Lượt đăng ký tư vấn" value={stats.leadCount} icon={MessageSquare} accent="gold" />
        <StatCard label="Lead mới (7 ngày)" value={stats.newLeadsThisWeek} icon={MessageSquare} accent="royal" />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Truy cập nhanh</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <Button asChild variant="outline">
            <Link href="/admin/nguoi-dung">Quản lý người dùng</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/admin/bai-hoc">Quản lý bài học</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/admin/dang-ky-tu-van">Xem lead đăng ký tư vấn</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/admin/bao-cao">Xem báo cáo chi tiết</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
