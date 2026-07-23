import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { DataTable } from "@/components/shared/data-table";
import { SimpleActionForm } from "@/components/admin/simple-action-form";
import { UnlinkButton } from "@/components/admin/unlink-button";
import { linkParentStudentAction } from "@/features/admin/users/actions";
import { listParentsAdmin, listProfilesByRole } from "@/lib/data/admin";

export const metadata: Metadata = { title: "Phụ huynh", robots: { index: false } };

export default async function AdminParentsPage() {
  const [parents, students] = await Promise.all([listParentsAdmin(), listProfilesByRole("student")]);

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6">
      <PageHeader title="Phụ huynh" breadcrumbs={[{ label: "Tổng quan", href: "/admin" }, { label: "Phụ huynh" }]} />

      <Card>
        <CardHeader>
          <CardTitle>Liên kết phụ huynh với học viên</CardTitle>
        </CardHeader>
        <CardContent>
          <SimpleActionForm action={linkParentStudentAction} submitLabel="Liên kết">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="parentProfileId">Phụ huynh</Label>
                <Select id="parentProfileId" name="parentProfileId" required>
                  {parents.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.fullName}
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
            </div>
          </SimpleActionForm>
        </CardContent>
      </Card>

      <DataTable
        columns={[
          { key: "name", header: "Họ tên", render: (row) => row.fullName },
          { key: "phone", header: "SĐT", render: (row) => row.phone ?? "—" },
          {
            key: "students",
            header: "Học viên liên kết",
            render: (row) => (
              <div className="flex flex-wrap gap-2">
                {row.linkedStudents.length === 0 && <span className="text-muted-foreground">Chưa liên kết</span>}
                {row.linkedStudents.map((link) => (
                  <span key={link.linkId} className="flex items-center gap-1 rounded-full bg-muted px-2 py-1 text-xs">
                    {link.studentName}
                    <UnlinkButton linkId={link.linkId} />
                  </span>
                ))}
              </div>
            ),
          },
        ]}
        rows={parents}
        emptyTitle="Chưa có phụ huynh nào"
      />
    </div>
  );
}
