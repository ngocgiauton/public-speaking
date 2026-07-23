import type { Metadata } from "next";
import { PillarCard } from "@/components/public/pillar-card";
import { pillars, platformExperienceSteps, problemStatements } from "@/config/site";
import { RANKS } from "@/config/gamification";

export const metadata: Metadata = {
  title: "Chương trình",
  description: "Tổng quan chương trình Public Speaking – Diễn Giả Nhí.",
};

export default function ProgramPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6">
      <h1 className="font-heading text-3xl font-bold">Chương trình</h1>
      <p className="mt-4 max-w-3xl text-muted-foreground">
        Chương trình được thiết kế để giải quyết những rào cản phổ biến khi trẻ nói trước đám đông,
        thông qua bốn trụ cột kỹ năng và một hệ thống học tập kết hợp game hóa.
      </p>

      <h2 className="mt-10 font-heading text-xl font-bold">Vấn đề chương trình giải quyết</h2>
      <ul className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
        {problemStatements.map((p) => (
          <li key={p} className="rounded-[var(--radius-control)] bg-muted px-4 py-2 text-sm">
            {p}
          </li>
        ))}
      </ul>

      <h2 className="mt-10 font-heading text-xl font-bold">Bốn trụ cột kỹ năng</h2>
      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {pillars.map((pillar) => (
          <PillarCard key={pillar.slug} title={pillar.title} subtitle={pillar.subtitle} description={pillar.description} />
        ))}
      </div>

      <h2 className="mt-10 font-heading text-xl font-bold">Trải nghiệm học tập</h2>
      <ol className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {platformExperienceSteps.map((step, i) => (
          <li key={step} className="rounded-[var(--radius-card)] border border-border p-3 text-center text-sm">
            <span className="font-heading font-bold text-brand-royal">{i + 1}.</span> {step}
          </li>
        ))}
      </ol>

      <h2 className="mt-10 font-heading text-xl font-bold">Rank thành tích</h2>
      <p className="mt-2 text-sm text-muted-foreground">
        Rank thành tích tăng dần theo tổng XP tích lũy — tách biệt với level học thuật của khóa học.
      </p>
      <ol className="mt-4 flex flex-wrap gap-2">
        {RANKS.map((rank) => (
          <li key={rank.slug} className="rounded-full bg-brand-royal/10 px-4 py-2 text-sm font-medium text-brand-royal">
            {rank.name} <span className="text-muted-foreground">({rank.minXp}+ XP)</span>
          </li>
        ))}
      </ol>
    </div>
  );
}
