import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { DataTable } from "@/components/shared/data-table";
import { SimpleActionForm } from "@/components/admin/simple-action-form";
import { createClassAction, assignTeacherToClassAction, enrollStudentAction } from "@/features/admin/classes/actions";
import { listClassesAdmin, listCourses, listProfilesByRole } from "@/lib/data/admin";

export const metadata: Metadata = { title: "Lớp học", robots: { index: false } };

export default async function AdminClassesPage() {
  const [classes, courses, teachers, students] = await Promise.all([
    listClassesAdmin(),
    listCourses(),
    listProfilesByRole("teacher"),
    listProfilesByRole("student"),
  ]);

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6">
      <PageHeader title="Quản lý lớp học" breadcrumbs={[{ label: "Tổng quan", href: "/admin" }, { label: "Lớp học" }]} />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Tạo lớp mới</CardTitle>
          </CardHeader>
          <CardContent>
            <SimpleActionForm action={createClassAction} submitLabel="Tạo lớp">
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
                <Label htmlFor="name">Tên lớp</Label>
                <Input id="name" name="name" required maxLength={150} />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="startDate">Ngày bắt đầu</Label>
                <Input id="startDate" name="startDate" type="date" />
              </div>
            </SimpleActionForm>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Phân công giáo viên</CardTitle>
          </CardHeader>
          <CardContent>
            <SimpleActionForm action={assignTeacherToClassAction} submitLabel="Phân công">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="classId">Lớp</Label>
                <Select id="classId" name="classId" required>
                  {classes.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </Select>
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="teacherProfileId">Giáo viên</Label>
                <Select id="teacherProfileId" name="teacherProfileId" required>
                  {teachers.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.full_name}
                    </option>
                  ))}
                </Select>
              </div>
            </SimpleActionForm>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Ghi danh học viên</CardTitle>
          </CardHeader>
          <CardContent>
            <SimpleActionForm action={enrollStudentAction} submitLabel="Ghi danh">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="classId2">Lớp</Label>
                <Select id="classId2" name="classId" required>
                  {classes.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </Select>
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="studentProfileId">Học viên</Label>
                <Select id="studentProfileId" name="studentProfileId" required>
                  {students.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.full_name}
                    </option>
                  ))}
                </Select>
              </div>
            </SimpleActionForm>
          </CardContent>
        </Card>
      </div>

      <DataTable
        columns={[
          {
            key: "name",
            header: "Tên lớp",
            render: (row) => (
              <Link href={`/teacher/lop-hoc/${row.id}`} className="font-medium hover:underline">
                {row.name}
              </Link>
            ),
          },
          { key: "course", header: "Khóa học", render: (row) => row.courseTitle },
          { key: "status", header: "Trạng thái", render: (row) => <Badge variant={row.status === "active" ? "success" : "neutral"}>{row.status}</Badge> },
          { key: "students", header: "Sĩ số", render: (row) => row.studentCount },
        ]}
        rows={classes}
        emptyTitle="Chưa có lớp học nào"
      />
    </div>
  );
}
