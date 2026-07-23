import Link from "next/link";
import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { publicEnv } from "@/config/env";
import { PRACTICE_ITEMS } from "@/config/practice";

export const metadata: Metadata = { title: "Phòng luyện tập", robots: { index: false } };

export default function PracticeRoomPage() {
  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6">
      <PageHeader
        title="Phòng luyện tập"
        description="Luyện tập nhanh từng kỹ năng riêng lẻ, không cần chờ tới bài học."
        breadcrumbs={[{ label: "Tổng quan", href: "/student" }, { label: "Phòng luyện tập" }]}
      />

      <div className="rounded-[var(--radius-card)] border border-dashed border-brand-gold/50 bg-brand-gold/5 p-5">
        <div className="flex items-center gap-2">
          <Badge variant="gold">Sắp ra mắt</Badge>
          <p className="font-heading font-semibold">AI Speech Coach</p>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          Trong tương lai, AI sẽ phân tích tốc độ nói, khoảng ngừng, ánh mắt và sự tự tin để đưa ra gợi ý
          luyện tập cá nhân hóa. Tính năng này{" "}
          {publicEnv.NEXT_PUBLIC_ENABLE_AI_SPEECH_COACH ? "đang bật ở chế độ thử nghiệm" : "chưa được kích hoạt"} trong
          phiên bản hiện tại.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {PRACTICE_ITEMS.map((item) => (
          <Link key={item.slug} href={`/student/luyen-tap/${item.slug}`}>
            <Card className="h-full transition-shadow hover:shadow-md">
              <CardContent className="flex flex-col gap-2 p-5">
                <Badge variant="royal">{item.skill}</Badge>
                <p className="font-heading font-semibold">{item.name}</p>
                <p className="text-sm text-muted-foreground">
                  {item.level} · {item.durationSeconds}s
                </p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
