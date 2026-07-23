import type { Metadata } from "next";
import { FaqAccordion } from "@/components/public/faq-accordion";
import { getFaqFallback, getPublishedFaqItems } from "@/lib/data/public-content";

export const metadata: Metadata = {
  title: "Câu hỏi thường gặp",
  description: "Giải đáp các câu hỏi thường gặp về chương trình Public Speaking – Diễn Giả Nhí.",
};

export default async function FaqPage() {
  const items = (await getPublishedFaqItems()) ?? getFaqFallback();

  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <h1 className="font-heading text-3xl font-bold">Câu hỏi thường gặp</h1>
      <p className="mt-4 text-muted-foreground">
        Một số thông tin cụ thể (độ tuổi, học phí, lịch khai giảng...) sẽ được cập nhật khi có quyết
        định chính thức từ Royal Public Speaking Club.
      </p>
      <div className="mt-8">
        <FaqAccordion items={items.map((i) => ({ question: i.question, answer: i.answer }))} />
      </div>
    </div>
  );
}
