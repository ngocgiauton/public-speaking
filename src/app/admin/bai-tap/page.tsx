import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/shared/data-table";
import { AssignmentForm } from "@/components/admin/assignment-form";
import { PublishToggleButton } from "@/components/admin/publish-toggle-button";
import { createAssignmentAction, toggleAssignmentPublishAction } from "@/features/admin/assignments/actions";
import { listAssignmentsAdmin, listLessonsAdmin } from "@/lib/data/admin";

export const metadata: Metadata = { title: "Bài tập", robots: { index: false } };

export default async function AdminAssignmentsPage() {
  const [assignments, lessons] = await Promise.all([listAssignmentsAdmin(), listLessonsAdmin()]);

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6">
      <PageHeader title="Bài tập" breadcrumbs={[{ label: "Tổng quan", href: "/admin" }, { label: "Bài tập" }]} />

      <Card>
        <CardHeader>
          <CardTitle>Tạo bài tập mới</CardTitle>
        </CardHeader>
        <CardContent>
          <AssignmentForm lessons={lessons} action={createAssignmentAction} submitLabel="Tạo bài tập" />
        </CardContent>
      </Card>

      <DataTable
        columns={[
          {
            key: "title",
            header: "Tiêu đề",
            render: (row) => (
              <Link href={`/admin/bai-tap/${row.id}`} className="font-medium hover:underline">
                {row.title}
              </Link>
            ),
          },
          { key: "lesson", header: "Bài học", render: (row) => `Buổi ${row.lessonSessionNumber} — ${row.lessonTitle}` },
          { key: "type", header: "Loại", render: (row) => row.assignment_type },
          {
            key: "status",
            header: "Trạng thái",
            render: (row) => <Badge variant={row.is_published ? "success" : "neutral"}>{row.is_published ? "Đã xuất bản" : "Nháp"}</Badge>,
          },
          {
            key: "actions",
            header: "Thao tác",
            render: (row) => (
              <PublishToggleButton isPublished={row.is_published} onToggle={toggleAssignmentPublishAction.bind(null, row.id)} />
            ),
          },
        ]}
        rows={assignments}
        emptyTitle="Chưa có bài tập nào"
      />
    </div>
  );
}
