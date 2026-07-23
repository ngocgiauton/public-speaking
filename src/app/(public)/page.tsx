import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PillarCard } from "@/components/public/pillar-card";
import { TestimonialCard } from "@/components/public/testimonial-card";
import {
  pillars,
  platformExperienceSteps,
  problemStatements,
  siteConfig,
} from "@/config/site";
import { ACADEMIC_LEVELS } from "@/config/gamification";
import { getPublishedTestimonials } from "@/lib/data/public-content";

export const metadata: Metadata = {
  title: `${siteConfig.name}`,
  description: siteConfig.description,
};

export default async function HomePage() {
  const testimonials = await getPublishedTestimonials();

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-brand-navy text-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(245,158,11,0.15),transparent_45%),radial-gradient(circle_at_80%_60%,rgba(30,64,175,0.4),transparent_50%)]" />
        <div className="relative mx-auto flex max-w-6xl flex-col items-start gap-6 px-4 py-20 sm:px-6 lg:py-28">
          <p className="text-sm font-semibold uppercase tracking-widest text-brand-gold">
            {siteConfig.organization}
          </p>
          <h1 className="max-w-3xl font-heading text-4xl font-bold leading-tight sm:text-5xl">
            {siteConfig.name}
          </h1>
          <p className="font-heading text-xl font-semibold text-brand-gold">{siteConfig.slogan}</p>
          <p className="max-w-2xl text-lg text-slate-200">{siteConfig.description}</p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg" variant="gold">
              <Link href="/dang-ky-tu-van">
                Bắt đầu hành trình
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10">
              <Link href="/lo-trinh">Khám phá lộ trình 22 buổi</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Vấn đề chương trình giải quyết */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <h2 className="font-heading text-2xl font-bold sm:text-3xl">
          Những vấn đề chương trình giải quyết
        </h2>
        <ul className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {problemStatements.map((problem) => (
            <li key={problem} className="flex items-start gap-3 rounded-[var(--radius-card)] border border-border p-4">
              <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-brand-royal" aria-hidden="true" />
              <span>{problem}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* Bốn trụ cột */}
      <section className="bg-muted py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <h2 className="font-heading text-2xl font-bold sm:text-3xl">Bốn trụ cột kỹ năng</h2>
          <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {pillars.map((pillar) => (
              <PillarCard
                key={pillar.slug}
                title={pillar.title}
                subtitle={pillar.subtitle}
                description={pillar.description}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Lộ trình 22 buổi */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <h2 className="font-heading text-2xl font-bold sm:text-3xl">Lộ trình 22 buổi</h2>
          <Button asChild variant="link">
            <Link href="/lo-trinh">
              Xem chi tiết lộ trình <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </Button>
        </div>
        <ol className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {ACADEMIC_LEVELS.map((level) => (
            <li key={level.order} className="rounded-[var(--radius-card)] border border-border p-5">
              <Badge variant="royal">Level {level.order}</Badge>
              <p className="mt-2 font-heading font-semibold">{level.name}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* Trải nghiệm nền tảng */}
      <section className="bg-brand-navy py-16 text-white">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <h2 className="font-heading text-2xl font-bold sm:text-3xl">Trải nghiệm trên nền tảng</h2>
          <ol className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
            {platformExperienceSteps.map((step, index) => (
              <li key={step} className="rounded-[var(--radius-card)] border border-white/15 p-4 text-center">
                <span className="font-heading text-2xl font-bold text-brand-gold">{index + 1}</span>
                <p className="mt-1 text-sm">{step}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Chủ nhiệm chương trình */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="grid grid-cols-1 gap-8 rounded-[var(--radius-card)] border border-border p-8 sm:grid-cols-3">
          <div className="flex flex-col items-center gap-3 sm:col-span-1">
            <div className="flex h-28 w-28 items-center justify-center rounded-full bg-brand-royal/10 font-heading text-3xl font-bold text-brand-royal">
              {siteConfig.director
                .split(" ")
                .slice(-2)
                .map((p) => p[0])
                .join("")}
            </div>
            <p className="text-center font-heading font-semibold">{siteConfig.director}</p>
            <p className="text-center text-sm text-muted-foreground">{siteConfig.directorTitle}</p>
          </div>
          <div className="sm:col-span-2">
            <Badge variant="warning">Nội dung placeholder</Badge>
            <p className="mt-3 text-sm text-muted-foreground">
              Tiểu sử chi tiết, chứng chỉ và thành tích của chủ nhiệm chương trình sẽ được Royal Public
              Speaking Club cập nhật tại đây. Vui lòng liên hệ đăng ký tư vấn để tìm hiểu thêm.
            </p>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      {testimonials.length > 0 && (
        <section className="bg-muted py-16">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <h2 className="font-heading text-2xl font-bold sm:text-3xl">Phản hồi</h2>
            <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-3">
              {testimonials.map((t) => (
                <TestimonialCard
                  key={t.id}
                  authorName={t.author_name}
                  authorRole={t.author_role}
                  content={t.content}
                  isPlaceholder={t.is_placeholder}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA cuối trang */}
      <section className="mx-auto max-w-4xl px-4 py-20 text-center sm:px-6">
        <h2 className="font-heading text-3xl font-bold">Sẵn sàng để con bạn Speak to Lead?</h2>
        <p className="mt-3 text-muted-foreground">
          Đăng ký tư vấn ngay hôm nay để đội ngũ Royal Public Speaking Club đồng hành cùng con.
        </p>
        <Button asChild size="lg" variant="gold" className="mt-6">
          <Link href="/dang-ky-tu-van">Đăng ký tư vấn miễn phí</Link>
        </Button>
      </section>
    </>
  );
}
