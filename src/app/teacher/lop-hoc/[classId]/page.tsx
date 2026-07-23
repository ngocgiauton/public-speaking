import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/layout/page-header";
import { DataTable } from "@/components/shared/data-table";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { UnauthorizedState } from "@/components/shared/error-state";
import { getCurrentUser } from "@/lib/auth/session";
import { getClassDetail, verifyTeacherOwnsClass } from "@/lib/data/teacher";

export const metadata: Metadata = { title: "Chi tiết lớp học", robots: { index: false } };

export default async function TeacherClassDetailPage({
  params,
}: {
  params: Promise<{ classId: string }>;
}) {
  const { classId } = await params;
  const user = await getCurrentUser();

  const isOwner = await verifyTeacherOwnsClass(user!.id, classId);
  if (!isOwner) return <UnauthorizedState />;

  const detail = await getClassDetail(classId);
  if (!detail) notFound();

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6">
      <PageHeader
        title={detail.classRow.name}
        description={detail.courseTitle}
        breadcrumbs={[{ label: "Lớp học", href: "/teacher/lop-hoc" }, { label: detail.classRow.name }]}
      />

      <DataTable
        columns={[
          {
            key: "name",
            header: "Học viên",
            render: (row) => (
              <Link href={`/teacher/hoc-vien/${row.profileId}`} className="font-medium hover:underline">
                {row.fullName}
              </Link>
            ),
          },
          {
            key: "progress",
            header: "Tiến độ",
            render: (row) => (
              <div className="w-40">
                <Progress value={Math.round((row.completedLessons / row.totalLessons) * 100)} />
                <span className="text-xs text-muted-foreground">
                  {row.completedLessons}/{row.totalLessons} bài
                </span>
              </div>
            ),
          },
          {
            key: "score",
            header: "Điểm gần nhất",
            render: (row) => (row.latestScore != null ? `${row.latestScore}/100` : "—"),
          },
          {
            key: "action",
            header: "",
            render: (row) => (
              <Button asChild size="sm" variant="outline">
                <Link href={`/teacher/hoc-vien/${row.profileId}`}>Xem chi tiết</Link>
              </Button>
            ),
          },
        ]}
        rows={detail.students.map((s) => ({ ...s, id: s.profileId }))}
        emptyTitle="Chưa có học viên trong lớp"
      />
    </div>
  );
}
