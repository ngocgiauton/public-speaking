import type { Metadata } from "next";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = { title: "Chính sách bảo mật" };

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <h1 className="font-heading text-3xl font-bold">Chính sách bảo mật</h1>
      <div className="prose prose-slate mt-6 max-w-none text-muted-foreground">
        <p>
          {siteConfig.organization} cam kết bảo vệ thông tin cá nhân của học viên và phụ huynh. Dữ
          liệu đăng ký tư vấn, hồ sơ học viên và video bài tập chỉ được sử dụng cho mục đích vận hành
          chương trình học, không chia sẻ cho bên thứ ba khi chưa có sự đồng ý.
        </p>
        <ul>
          <li>Video bài tập được lưu trữ riêng tư, chỉ giáo viên phụ trách và phụ huynh liên kết được xem.</li>
          <li>Học viên và phụ huynh có thể yêu cầu xem hoặc xóa dữ liệu cá nhân theo quy định pháp luật hiện hành.</li>
          <li>
            Thông tin liên hệ chính thức để yêu cầu về dữ liệu cá nhân sẽ được cập nhật tại đây khi có
            quyết định từ {siteConfig.organization}.
          </li>
        </ul>
        <p>
          Đây là nội dung mẫu — cần được rà soát và cập nhật chính thức trước khi vận hành thực tế.
        </p>
      </div>
    </div>
  );
}
