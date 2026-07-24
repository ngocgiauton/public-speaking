import Link from "next/link";
import { siteConfig } from "@/config/site";

export function PublicFooter() {
  return (
    <footer className="border-t border-border bg-brand-navy text-inverse-on-surface/70">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
          <div>
            <p className="font-heading text-lg font-bold text-white">{siteConfig.organization}</p>
            <p className="mt-2 text-sm">{siteConfig.name}</p>
            <p className="mt-1 text-sm font-medium text-brand-gold">{siteConfig.slogan}</p>
          </div>
          <div>
            <p className="text-sm font-semibold text-white">Khám phá</p>
            <ul className="mt-2 flex flex-col gap-1.5 text-sm">
              <li><Link href="/gioi-thieu" className="hover:text-white">Giới thiệu</Link></li>
              <li><Link href="/chuong-trinh" className="hover:text-white">Chương trình</Link></li>
              <li><Link href="/lo-trinh" className="hover:text-white">Lộ trình 22 buổi</Link></li>
              <li><Link href="/cau-hoi-thuong-gap" className="hover:text-white">Câu hỏi thường gặp</Link></li>
            </ul>
          </div>
          <div>
            <p className="text-sm font-semibold text-white">Pháp lý</p>
            <ul className="mt-2 flex flex-col gap-1.5 text-sm">
              <li><Link href="/dieu-khoan" className="hover:text-white">Điều khoản sử dụng</Link></li>
              <li><Link href="/bao-mat" className="hover:text-white">Chính sách bảo mật</Link></li>
            </ul>
          </div>
        </div>
        <p className="mt-8 border-t border-white/10 pt-6 text-xs text-inverse-on-surface/50">
          © {new Date().getFullYear()} {siteConfig.organization}. Thông tin liên hệ chính thức sẽ được cập nhật.
        </p>
      </div>
    </footer>
  );
}
