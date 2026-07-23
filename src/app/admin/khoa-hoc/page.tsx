import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { DataTable } from "@/components/shared/data-table";
import { Badge } from "@/components/ui/badge";
import { SimpleActionForm } from "@/components/admin/simple-action-form";
import { PublishToggleButton } from "@/components/admin/publish-toggle-button";
import { createCourseAction, toggleCoursePublishAction } from "@/features/admin/courses/actions";
import { listCourses } from "@/lib/data/admin";

export const metadata: Metadata = { title: "Khóa học", robots: { index: false } };

export default async function AdminCoursesPage() {
  const courses = await listCourses();

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6">
      <PageHeader title="Khóa học" breadcrumbs={[{ label: "Tổng quan", href: "/admin" }, { label: "Khóa học" }]} />

      <Card>
        <CardHeader>
          <CardTitle>Tạo khóa học mới</CardTitle>
        </CardHeader>
        <CardContent>
          <SimpleActionForm action={createCourseAction} submitLabel="Tạo khóa học">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="title">Tiêu đề</Label>
              <Input id="title" name="title" required maxLength={200} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="slug">Slug (không dấu, không khoảng trắng)</Label>
              <Input id="slug" name="slug" required pattern="[a-z0-9-]+" placeholder="vi-du-khoa-hoc" />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="description">Mô tả</Label>
              <Textarea id="description" name="description" maxLength={2000} />
            </div>
          </SimpleActionForm>
        </CardContent>
      </Card>

      <DataTable
        columns={[
          { key: "title", header: "Tiêu đề", render: (row) => row.title },
          { key: "slug", header: "Slug", render: (row) => row.slug },
          {
            key: "status",
            header: "Trạng thái",
            render: (row) => <Badge variant={row.is_published ? "success" : "neutral"}>{row.is_published ? "Đã xuất bản" : "Nháp"}</Badge>,
          },
          {
            key: "actions",
            header: "Thao tác",
            render: (row) => (
              <PublishToggleButton
                isPublished={row.is_published}
                onToggle={toggleCoursePublishAction.bind(null, row.id)}
              />
            ),
          },
        ]}
        rows={courses}
        emptyTitle="Chưa có khóa học nào"
      />
    </div>
  );
}
