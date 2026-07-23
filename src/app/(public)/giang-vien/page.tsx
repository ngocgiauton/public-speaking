import type { Metadata } from "next";
import { Badge } from "@/components/ui/badge";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "Giảng viên",
  description: `Đội ngũ giảng viên của ${siteConfig.organization}.`,
};

export default function InstructorsPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6">
      <h1 className="font-heading text-3xl font-bold">Giảng viên</h1>
      <p className="mt-4 text-muted-foreground">
        Đội ngũ giảng viên của {siteConfig.organization} trực tiếp đồng hành, chấm bài và phản hồi cho
        từng học viên trong suốt hành trình 22 buổi học.
      </p>

      <div className="mt-8 rounded-[var(--radius-card)] border border-border p-6">
        <p className="font-heading font-semibold">{siteConfig.director}</p>
        <p className="text-sm text-muted-foreground">{siteConfig.directorTitle}</p>
        <Badge variant="warning" className="mt-3">
          Nội dung placeholder
        </Badge>
        <p className="mt-2 text-sm text-muted-foreground">
          Tiểu sử, chứng chỉ và thành tích chi tiết sẽ được cập nhật khi có thông tin chính thức.
        </p>
      </div>

      <div className="mt-6 rounded-[var(--radius-card)] border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
        Thông tin đầy đủ về đội ngũ giảng viên sẽ được cập nhật tại đây. Vui lòng đăng ký tư vấn để
        được giới thiệu giáo viên phù hợp với học viên.
      </div>
    </div>
  );
}
