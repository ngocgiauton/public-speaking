import type { Metadata } from "next";
import { Badge } from "@/components/ui/badge";
import { pillars, siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "Giới thiệu",
  description: `Giới thiệu về ${siteConfig.organization} và chương trình ${siteConfig.name}.`,
};

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6">
      <h1 className="font-heading text-3xl font-bold">Giới thiệu</h1>
      <p className="mt-4 text-muted-foreground">
        {siteConfig.organization} tổ chức chương trình <strong>{siteConfig.name}</strong> — nền tảng
        học và luyện tập kỹ năng thuyết trình dành cho trẻ em và thiếu niên. Học viên không chỉ xem
        video mà thực hành, nộp bài, nhận phản hồi, tích lũy XP, mở khóa bài học và lên cấp độ.
      </p>
      <p className="mt-4 text-muted-foreground">
        Không chỉ học cách nói hay, học viên còn học cách xây dựng ý tưởng, kết nối với người nghe và
        tự tin dẫn dắt bằng tiếng nói của mình — đúng như slogan{" "}
        <span className="font-semibold text-brand-gold">{siteConfig.slogan}</span>.
      </p>

      <h2 className="mt-10 font-heading text-xl font-bold">Bốn trụ cột kỹ năng</h2>
      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
        {pillars.map((pillar) => (
          <div key={pillar.slug} className="rounded-[var(--radius-card)] border border-border p-4">
            <p className="text-xs font-semibold uppercase text-brand-gold">{pillar.subtitle}</p>
            <p className="font-heading font-semibold">{pillar.title}</p>
            <p className="mt-1 text-sm text-muted-foreground">{pillar.description}</p>
          </div>
        ))}
      </div>

      <h2 className="mt-10 font-heading text-xl font-bold">Chủ nhiệm chương trình</h2>
      <div className="mt-4 rounded-[var(--radius-card)] border border-border p-5">
        <p className="font-heading font-semibold">{siteConfig.director}</p>
        <p className="text-sm text-muted-foreground">{siteConfig.directorTitle}</p>
        <Badge variant="warning" className="mt-3">
          Nội dung placeholder
        </Badge>
        <p className="mt-2 text-sm text-muted-foreground">
          Tiểu sử chi tiết, chứng chỉ và thành tích sẽ được cập nhật tại đây khi có thông tin chính thức.
        </p>
      </div>
    </div>
  );
}
