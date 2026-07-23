import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/page-header";
import { DataTable } from "@/components/shared/data-table";
import { Badge } from "@/components/ui/badge";
import { RANKS, type RankSlug } from "@/config/gamification";
import { listStudentsAdmin } from "@/lib/data/admin";

export const metadata: Metadata = { title: "Học viên", robots: { index: false } };

export default async function AdminStudentsPage() {
  const students = await listStudentsAdmin();
  const rankNameBySlug = new Map(RANKS.map((r) => [r.slug, r.name]));

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6">
      <PageHeader title="Học viên" breadcrumbs={[{ label: "Tổng quan", href: "/admin" }, { label: "Học viên" }]} />

      <DataTable
        columns={[
          { key: "name", header: "Họ tên", render: (row) => row.fullName },
          { key: "rank", header: "Rank", render: (row) => <Badge variant="gold">{rankNameBySlug.get(row.rankSlug as RankSlug)}</Badge> },
          { key: "xp", header: "XP", render: (row) => row.totalXp },
          { key: "streak", header: "Chuỗi ngày", render: (row) => row.streak },
          { key: "parents", header: "Phụ huynh liên kết", render: (row) => row.parentCount },
          {
            key: "status",
            header: "Trạng thái",
            render: (row) => <Badge variant={row.status === "active" ? "success" : "error"}>{row.status}</Badge>,
          },
        ]}
        rows={students}
        emptyTitle="Chưa có học viên nào"
      />
    </div>
  );
}
