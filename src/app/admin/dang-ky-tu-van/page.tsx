import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/page-header";
import { DataTable } from "@/components/shared/data-table";
import { FilterBar } from "@/components/shared/filter-bar";
import { LeadStatusSelect } from "@/components/admin/lead-status-select";
import { formatDateTime } from "@/lib/utils/format";
import { listLeadsAdmin } from "@/lib/data/admin";
import type { LeadStatus } from "@/types/database";

export const metadata: Metadata = { title: "Đăng ký tư vấn", robots: { index: false } };

export default async function AdminLeadsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const params = await searchParams;
  const leads = await listLeadsAdmin(params.status);

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6">
      <PageHeader title="Đăng ký tư vấn" breadcrumbs={[{ label: "Tổng quan", href: "/admin" }, { label: "Đăng ký tư vấn" }]} />

      <FilterBar
        fields={[
          {
            key: "status",
            label: "Trạng thái",
            type: "select",
            options: [
              { value: "new", label: "Mới" },
              { value: "contacted", label: "Đã liên hệ" },
              { value: "consulting", label: "Đang tư vấn" },
              { value: "registered", label: "Đã đăng ký" },
              { value: "not_suitable", label: "Không phù hợp" },
            ],
          },
        ]}
      />

      <DataTable
        columns={[
          { key: "student", header: "Học viên", render: (row) => row.student_full_name },
          { key: "parent", header: "Phụ huynh", render: (row) => row.parent_full_name },
          { key: "phone", header: "SĐT", render: (row) => row.phone },
          { key: "goal", header: "Mục tiêu", render: (row) => row.learning_goal ?? "—" },
          { key: "createdAt", header: "Ngày gửi", render: (row) => formatDateTime(row.created_at) },
          {
            key: "status",
            header: "Trạng thái",
            render: (row) => <LeadStatusSelect leadId={row.id} status={row.status as LeadStatus} />,
          },
        ]}
        rows={leads}
        emptyTitle="Chưa có đăng ký tư vấn nào"
      />
    </div>
  );
}
