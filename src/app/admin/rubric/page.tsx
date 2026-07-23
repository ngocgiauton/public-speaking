import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RUBRIC_GROUPS, RUBRIC_MAX_TOTAL } from "@/config/gamification";

export const metadata: Metadata = { title: "Rubric", robots: { index: false } };

export default function AdminRubricPage() {
  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      <PageHeader
        title="Rubric chấm điểm"
        description={`Cấu trúc rubric chuẩn — tổng ${RUBRIC_MAX_TOTAL} điểm, dùng làm nguồn tiêu chí cho tất cả bài tập.`}
        breadcrumbs={[{ label: "Tổng quan", href: "/admin" }, { label: "Rubric" }]}
      />

      <p className="text-sm text-muted-foreground">
        Đây là cấu trúc rubric tham chiếu (định nghĩa trong mã nguồn <code>src/config/gamification.ts</code>).
        Khi tạo/sửa bài tập tại trang{" "}
        <Link href="/admin/bai-tap" className="text-brand-royal underline">
          Bài tập
        </Link>
        , admin chọn tập con tiêu chí phù hợp cho từng bài — không nhất thiết phải dùng toàn bộ 100 điểm.
      </p>

      <div className="flex flex-col gap-4">
        {RUBRIC_GROUPS.map((group) => (
          <Card key={group.key}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>{group.label}</CardTitle>
                <Badge variant="royal">{group.maxScore} điểm</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="flex flex-col gap-1 text-sm">
                {group.criteria.map((c) => (
                  <li key={c.key} className="flex justify-between border-b border-border py-1 last:border-0">
                    <span>{c.label}</span>
                    <span className="text-muted-foreground">{c.maxScore} điểm</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
