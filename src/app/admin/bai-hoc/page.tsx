import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/shared/data-table";
import { LessonForm } from "@/components/admin/lesson-form";
import { PublishToggleButton } from "@/components/admin/publish-toggle-button";
import { createLessonAction, toggleLessonPublishAction } from "@/features/admin/lessons/actions";
import { listCourseLevels, listLessonsAdmin } from "@/lib/data/admin";

export const metadata: Metadata = { title: "Bài học", robots: { index: false } };

export default async function AdminLessonsPage() {
  const [lessons, levels] = await Promise.all([listLessonsAdmin(), listCourseLevels()]);

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6">
      <PageHeader title="Bài học" breadcrumbs={[{ label: "Tổng quan", href: "/admin" }, { label: "Bài học" }]} />

      <Card>
        <CardHeader>
          <CardTitle>Tạo bài học mới</CardTitle>
        </CardHeader>
        <CardContent>
          <LessonForm levels={levels} action={createLessonAction} submitLabel="Tạo bài học" />
        </CardContent>
      </Card>

      <DataTable
        columns={[
          { key: "session", header: "Buổi", render: (row) => row.session_number },
          {
            key: "title",
            header: "Tiêu đề",
            render: (row) => (
              <Link href={`/admin/bai-hoc/${row.id}`} className="font-medium hover:underline">
                {row.title}
              </Link>
            ),
          },
          { key: "level", header: "Level", render: (row) => row.levelName },
          {
            key: "status",
            header: "Trạng thái",
            render: (row) => <Badge variant={row.is_published ? "success" : "neutral"}>{row.is_published ? "Đã xuất bản" : "Nháp"}</Badge>,
          },
          {
            key: "actions",
            header: "Thao tác",
            render: (row) => (
              <PublishToggleButton isPublished={row.is_published} onToggle={toggleLessonPublishAction.bind(null, row.id)} />
            ),
          },
        ]}
        rows={lessons}
        emptyTitle="Chưa có bài học nào"
      />
    </div>
  );
}
