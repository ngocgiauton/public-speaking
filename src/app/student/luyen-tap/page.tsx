import Link from "next/link";
import type { Metadata } from "next";
import {
  BookOpen,
  DoorOpen,
  Eye,
  Flag,
  Gauge,
  Hand,
  PauseCircle,
  PersonStanding,
  Shuffle,
  Smile,
  Speech,
  Volume2,
  Zap,
  type LucideIcon,
} from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { publicEnv } from "@/config/env";
import { PRACTICE_ITEMS, type PracticeItem } from "@/config/practice";
import { cn } from "@/lib/utils/cn";

export const metadata: Metadata = { title: "Phòng luyện tập", robots: { index: false } };

const SKILL_ICONS: Record<PracticeItem["skill"], LucideIcon> = {
  "Eye Contact": Eye,
  Posture: PersonStanding,
  Gesture: Hand,
  "Facial Expression": Smile,
  Pronunciation: Speech,
  Volume: Volume2,
  Pace: Gauge,
  Pause: PauseCircle,
  Emphasis: Zap,
  Storytelling: BookOpen,
  Opening: DoorOpen,
  Closing: Flag,
  "Impromptu Speech": Shuffle,
};

const LEVEL_STYLES: Record<PracticeItem["level"], { circle: string; badge: "warning" | "error" | "gold" }> = {
  "Cơ bản": { circle: "bg-tertiary-container text-on-tertiary-container", badge: "warning" },
  "Trung bình": { circle: "bg-secondary text-on-secondary", badge: "error" },
  "Nâng cao": { circle: "bg-primary-container text-on-primary-container", badge: "gold" },
};

export default function PracticeRoomPage() {
  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6">
      <PageHeader
        title="Phòng luyện tập"
        description="Chọn một kỹ năng để tập trung hôm nay. Những diễn giả xuất sắc được hình thành từ từng thói quen nhỏ."
        breadcrumbs={[{ label: "Tổng quan", href: "/student" }, { label: "Phòng luyện tập" }]}
      />

      <div className="rounded-[var(--radius-card)] border border-dashed border-brand-gold/50 bg-brand-gold/5 p-5">
        <div className="flex items-center gap-2">
          <Badge variant="gold">Sắp ra mắt</Badge>
          <p className="font-heading font-semibold text-on-surface">AI Speech Coach</p>
        </div>
        <p className="mt-1 text-sm text-on-surface-variant">
          Trong tương lai, AI sẽ phân tích tốc độ nói, khoảng ngừng, ánh mắt và sự tự tin để đưa ra gợi ý
          luyện tập cá nhân hóa. Tính năng này{" "}
          {publicEnv.NEXT_PUBLIC_ENABLE_AI_SPEECH_COACH ? "đang bật ở chế độ thử nghiệm" : "chưa được kích hoạt"} trong
          phiên bản hiện tại.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {PRACTICE_ITEMS.map((item, index) => {
          const Icon = SKILL_ICONS[item.skill];
          const { circle, badge } = LEVEL_STYLES[item.level];
          return (
            <Card key={item.slug} className="flex h-full flex-col gap-4 p-6">
              <div className="flex items-start justify-between">
                <div className={cn("flex h-14 w-14 items-center justify-center rounded-full", circle)}>
                  <Icon className="h-6 w-6" aria-hidden="true" />
                </div>
                <Badge variant={badge}>{item.level}</Badge>
              </div>
              <div>
                <p className="font-headline-md text-headline-md text-on-surface">{item.name}</p>
                <p className="font-label-md text-label-md uppercase tracking-wide text-on-surface-variant">
                  {item.skill}
                </p>
              </div>
              <p className="flex-1 font-body-md text-body-md text-on-surface-variant">{item.instructions}</p>
              <Button asChild variant={index % 3 === 0 ? "primary" : "outline"}>
                <Link href={`/student/luyen-tap/${item.slug}`}>
                  Bắt đầu · {item.durationSeconds}s
                </Link>
              </Button>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
