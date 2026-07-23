import type { Metadata } from "next";
import { ConsultationForm } from "@/components/public/consultation-form";

export const metadata: Metadata = {
  title: "Đăng ký tư vấn",
  description: "Đăng ký để nhận tư vấn miễn phí về chương trình Public Speaking – Diễn Giả Nhí.",
};

export default function ConsultationPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6">
      <h1 className="font-heading text-3xl font-bold">Đăng ký tư vấn</h1>
      <p className="mt-4 text-muted-foreground">
        Điền thông tin bên dưới, đội ngũ Royal Public Speaking Club sẽ liên hệ để tư vấn lộ trình phù
        hợp cho con bạn.
      </p>
      <div className="mt-8">
        <ConsultationForm />
      </div>
    </div>
  );
}
