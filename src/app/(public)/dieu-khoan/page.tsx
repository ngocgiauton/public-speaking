import type { Metadata } from "next";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = { title: "Điều khoản sử dụng" };

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <h1 className="font-heading text-3xl font-bold">Điều khoản sử dụng</h1>
      <div className="prose prose-slate mt-6 max-w-none text-muted-foreground">
        <p>
          Đây là nội dung điều khoản sử dụng mẫu cho nền tảng {siteConfig.name} của{" "}
          {siteConfig.organization}. Nội dung chi tiết, đầy đủ về điều khoản (quyền và nghĩa vụ của
          học viên/phụ huynh, chính sách hủy/hoãn, quyền sở hữu nội dung...) cần được chủ sở hữu
          chương trình rà soát và cập nhật chính thức trước khi vận hành thực tế.
        </p>
        <ul>
          <li>Tài khoản chỉ được sử dụng bởi đúng người được cấp, không chia sẻ cho người khác.</li>
          <li>Nội dung bài học, video, quiz thuộc bản quyền của {siteConfig.organization}.</li>
          <li>Video bài tập do học viên nộp chỉ được sử dụng cho mục đích giảng dạy và đánh giá.</li>
        </ul>
      </div>
    </div>
  );
}
