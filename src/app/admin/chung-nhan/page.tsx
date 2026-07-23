import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { DataTable } from "@/components/shared/data-table";
import { SimpleActionForm } from "@/components/admin/simple-action-form";
import { createCertificateAction, issueCertificateAction } from "@/features/admin/certificates/actions";
import { listCertificatesAdmin, listCourses, listProfilesByRole } from "@/lib/data/admin";

export const metadata: Metadata = { title: "Chứng nhận", robots: { index: false } };

export default async function AdminCertificatesPage() {
  const [certificates, courses, students] = await Promise.all([
    listCertificatesAdmin(),
    listCourses(),
    listProfilesByRole("student"),
  ]);

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6">
      <PageHeader title="Chứng nhận" breadcrumbs={[{ label: "Tổng quan", href: "/admin" }, { label: "Chứng nhận" }]} />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Tạo mẫu chứng nhận</CardTitle>
          </CardHeader>
          <CardContent>
            <SimpleActionForm action={createCertificateAction} submitLabel="Tạo mẫu">
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
                <Label htmlFor="name">Tên chứng nhận</Label>
                <Input id="name" name="name" required maxLength={200} />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="description">Mô tả / điều kiện cấp</Label>
                <Textarea id="description" name="description" maxLength={1000} />
              </div>
            </SimpleActionForm>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Cấp chứng nhận cho học viên</CardTitle>
          </CardHeader>
          <CardContent>
            <SimpleActionForm action={issueCertificateAction} submitLabel="Cấp chứng nhận">
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
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="certificateId">Mẫu chứng nhận</Label>
                <Select id="certificateId" name="certificateId" required>
                  {certificates.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
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
          { key: "name", header: "Tên chứng nhận", render: (row) => row.name },
          { key: "description", header: "Mô tả", render: (row) => row.description ?? "—" },
        ]}
        rows={certificates}
        emptyTitle="Chưa có mẫu chứng nhận nào"
      />
    </div>
  );
}
