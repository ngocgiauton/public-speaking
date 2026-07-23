import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/layout/page-header";
import { DataTable } from "@/components/shared/data-table";
import { Badge } from "@/components/ui/badge";
import { listTeachersAdmin } from "@/lib/data/admin";

export const metadata: Metadata = { title: "Giáo viên", robots: { index: false } };

export default async function AdminTeachersPage() {
  const teachers = await listTeachersAdmin();

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6">
      <PageHeader title="Giáo viên" breadcrumbs={[{ label: "Tổng quan", href: "/admin" }, { label: "Giáo viên" }]} />

      <DataTable
        columns={[
          { key: "name", header: "Họ tên", render: (row) => row.fullName },
          {
            key: "classes",
            header: "Lớp phụ trách",
            render: (row) => (
              <div className="flex flex-wrap gap-1">
                {row.classes.length === 0 ? (
                  <span className="text-muted-foreground">Chưa được phân công</span>
                ) : (
                  row.classes.map((c, i) => (
                    <Badge key={i} variant="royal">
                      {c}
                    </Badge>
                  ))
                )}
              </div>
            ),
          },
        ]}
        rows={teachers}
        emptyTitle="Chưa có giáo viên nào"
      />
      <p className="text-sm text-muted-foreground">
        Để phân công giáo viên vào lớp, vào trang{" "}
        <Link href="/admin/lop-hoc" className="text-brand-royal underline">
          Quản lý lớp học
        </Link>
        .
      </p>
    </div>
  );
}
