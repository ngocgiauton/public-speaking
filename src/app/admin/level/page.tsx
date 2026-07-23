import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { DataTable } from "@/components/shared/data-table";
import { Badge } from "@/components/ui/badge";
import { SimpleActionForm } from "@/components/admin/simple-action-form";
import { createLevelAction } from "@/features/admin/courses/actions";
import { listCourseLevels, listCourses } from "@/lib/data/admin";

export const metadata: Metadata = { title: "Level học thuật", robots: { index: false } };

export default async function AdminLevelsPage() {
  const [levels, courses] = await Promise.all([listCourseLevels(), listCourses()]);
  const courseTitleById = new Map(courses.map((c) => [c.id, c.title]));

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6">
      <PageHeader title="Level học thuật" breadcrumbs={[{ label: "Tổng quan", href: "/admin" }, { label: "Level" }]} />

      <Card>
        <CardHeader>
          <CardTitle>Tạo level mới</CardTitle>
        </CardHeader>
        <CardContent>
          <SimpleActionForm action={createLevelAction} submitLabel="Tạo level">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="courseId">Khóa học</Label>
                <Select id="courseId" name="courseId" required>
                  {courses.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.title}
                    </option>
                  ))}
                </Select>
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="orderIndex">Thứ tự (0-5)</Label>
                <Input id="orderIndex" name="orderIndex" type="number" min={0} max={5} required />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="slug">Slug</Label>
                <Input id="slug" name="slug" required />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="name">Tên level</Label>
                <Input id="name" name="name" required />
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="description">Mô tả</Label>
              <Textarea id="description" name="description" maxLength={1000} />
            </div>
          </SimpleActionForm>
        </CardContent>
      </Card>

      <DataTable
        columns={[
          { key: "order", header: "Thứ tự", render: (row) => <Badge variant="royal">Level {row.order_index}</Badge> },
          { key: "name", header: "Tên", render: (row) => row.name },
          { key: "course", header: "Khóa học", render: (row) => courseTitleById.get(row.course_id) ?? "" },
        ]}
        rows={levels}
        emptyTitle="Chưa có level nào"
      />
    </div>
  );
}
