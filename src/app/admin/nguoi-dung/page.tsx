import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/shared/data-table";
import { FilterBar } from "@/components/shared/filter-bar";
import { Pagination } from "@/components/shared/pagination";
import { CreateUserForm } from "@/components/admin/create-user-form";
import { UserRowActions } from "@/components/admin/user-row-actions";
import { roleLabels } from "@/config/nav";
import { listUsers } from "@/lib/data/admin";
import { formatDate } from "@/lib/utils/format";
import type { UserRole } from "@/types/database";

export const metadata: Metadata = { title: "Người dùng", robots: { index: false } };

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; role?: string; status?: string; page?: string }>;
}) {
  const params = await searchParams;
  const page = Number(params.page ?? 1);
  const result = await listUsers({ search: params.search, role: params.role, status: params.status, page });
  const totalPages = Math.max(1, Math.ceil(result.totalCount / result.pageSize));

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6">
      <PageHeader title="Quản lý người dùng" breadcrumbs={[{ label: "Tổng quan", href: "/admin" }, { label: "Người dùng" }]} />

      <Card>
        <CardHeader>
          <CardTitle>Tạo tài khoản mới</CardTitle>
        </CardHeader>
        <CardContent>
          <CreateUserForm />
        </CardContent>
      </Card>

      <FilterBar
        fields={[
          { key: "search", label: "Tìm theo tên", type: "search" },
          {
            key: "role",
            label: "Vai trò",
            type: "select",
            options: Object.entries(roleLabels).map(([value, label]) => ({ value, label })),
          },
          {
            key: "status",
            label: "Trạng thái",
            type: "select",
            options: [
              { value: "active", label: "Hoạt động" },
              { value: "locked", label: "Đã khóa" },
            ],
          },
        ]}
      />

      <DataTable
        columns={[
          { key: "name", header: "Họ tên", render: (row) => row.full_name },
          {
            key: "role",
            header: "Vai trò",
            render: (row) => <Badge variant="royal">{roleLabels[row.role as UserRole]}</Badge>,
          },
          {
            key: "status",
            header: "Trạng thái",
            render: (row) => (
              <Badge variant={row.status === "active" ? "success" : "error"}>
                {row.status === "active" ? "Hoạt động" : "Đã khóa"}
              </Badge>
            ),
          },
          { key: "created", header: "Ngày tạo", render: (row) => formatDate(row.created_at) },
          {
            key: "actions",
            header: "Thao tác",
            render: (row) => <UserRowActions userId={row.id} role={row.role as UserRole} status={row.status} />,
          },
        ]}
        rows={result.rows}
        emptyTitle="Không tìm thấy người dùng nào"
      />

      <Pagination
        currentPage={result.page}
        totalPages={totalPages}
        basePath="/admin/nguoi-dung"
        searchParams={params}
      />
    </div>
  );
}
