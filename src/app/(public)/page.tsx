import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight, CheckCircle2, Hand, Mic2, PenLine, Theater } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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

const PILLAR_ICONS = [Hand, Mic2, PenLine, Theater];

export default async function HomePage() {
  const testimonials = await getPublishedTestimonials();

  return (
    <>
      {/* Hero */}
      <section className="w-full max-w-[1280px] mx-auto px-4 md:px-16 pt-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
          <div className="flex flex-col gap-6 z-10">
            <p className="font-label-md text-label-md uppercase tracking-widest text-primary">
              {siteConfig.organization}
            </p>
            <h1 className="font-display-lg text-[2.25rem] leading-tight sm:text-display-lg text-on-surface">
              {siteConfig.name}
            </h1>
            <p className="font-headline-md text-headline-md text-secondary">{siteConfig.slogan}</p>
            <p className="font-body-lg text-body-lg text-on-surface-variant max-w-lg">
              {siteConfig.description}
            </p>
            <div className="flex flex-wrap gap-3 pt-3">
              <Button asChild size="lg" variant="primary">
                <Link href="/dang-ky-tu-van">
                  Bắt đầu hành trình
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="/lo-trinh">Khám phá lộ trình 22 buổi</Link>
              </Button>
            </div>
          </div>
          <div className="relative h-[320px] md:h-[480px] rounded-[1.5rem] overflow-hidden shadow-warm bg-gradient-to-br from-primary-container via-tertiary-container to-secondary-container flex items-center justify-center">
            <Mic2 className="h-24 w-24 text-on-primary-container/70" aria-hidden="true" />
            <span className="absolute bottom-4 right-4 rounded-full bg-surface-container-lowest/90 px-3 py-1 font-label-sm text-label-sm text-on-surface-variant">
              Hình minh họa — chờ ảnh thật
            </span>
          </div>
        </div>
      </section>

      {/* Vấn đề chương trình giải quyết */}
      <section className="mx-auto max-w-6xl px-4 md:px-16 py-20">
        <h2 className="font-headline-lg-mobile md:font-headline-lg text-headline-lg-mobile md:text-headline-lg text-on-surface">
          Những vấn đề chương trình giải quyết
        </h2>
        <ul className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {problemStatements.map((problem) => (
            <li
              key={problem}
              className="flex items-start gap-3 rounded-[var(--radius-card)] border border-surface-variant bg-surface-container-lowest p-4"
            >
              <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
              <span className="text-on-surface-variant">{problem}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* Bốn trụ cột — bento grid */}
      <section className="w-full max-w-[1280px] mx-auto px-4 md:px-16">
        <div className="text-center mb-12">
          <h2 className="font-headline-lg-mobile md:font-headline-lg text-headline-lg-mobile md:text-headline-lg text-on-surface mb-1">
            Bốn trụ cột kỹ năng
          </h2>
          <p className="font-body-md text-body-md text-on-surface-variant">
            Nền tảng của nghệ thuật hùng biện xuất sắc
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {pillars.map((pillar, index) => {
            const Icon = PILLAR_ICONS[index] ?? Hand;
            return (
              <div
                key={pillar.slug}
                className="bg-surface-container-lowest rounded-3xl p-6 flex flex-col gap-3 border border-surface-variant hover:shadow-warm transition-all"
              >
                <div className="w-12 h-12 rounded-full bg-tertiary-fixed flex items-center justify-center">
                  <Icon className="h-6 w-6 text-on-tertiary-fixed" aria-hidden="true" />
                </div>
                <h3 className="font-headline-md text-headline-md text-on-surface">{pillar.title}</h3>
                <p className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">
                  {pillar.subtitle}
                </p>
                <p className="font-body-md text-body-md text-on-surface-variant">{pillar.description}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Lộ trình 22 buổi */}
      <section className="mx-auto max-w-6xl px-4 md:px-16 py-20">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <h2 className="font-headline-lg-mobile md:font-headline-lg text-headline-lg-mobile md:text-headline-lg text-on-surface">
            Lộ trình 22 buổi
          </h2>
          <Button asChild variant="link">
            <Link href="/lo-trinh">
              Xem chi tiết lộ trình <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </Button>
        </div>
        <ol className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {ACADEMIC_LEVELS.map((level) => (
            <li
              key={level.order}
              className="rounded-[var(--radius-card)] border border-surface-variant bg-surface-container-lowest p-5"
            >
              <Badge variant="royal">Level {level.order}</Badge>
              <p className="mt-2 font-heading font-semibold text-on-surface">{level.name}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* Trải nghiệm nền tảng */}
      <section className="bg-inverse-surface py-20">
        <div className="mx-auto max-w-6xl px-4 md:px-16">
          <h2 className="font-headline-lg-mobile md:font-headline-lg text-headline-lg-mobile md:text-headline-lg text-inverse-on-surface">
            Trải nghiệm trên nền tảng
          </h2>
          <ol className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
            {platformExperienceSteps.map((step, index) => (
              <li key={step} className="rounded-[var(--radius-card)] border border-white/15 p-4 text-center">
                <span className="font-heading text-2xl font-bold text-primary-fixed-dim">{index + 1}</span>
                <p className="mt-1 text-sm text-inverse-on-surface">{step}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Chủ nhiệm chương trình */}
      <section className="mx-auto max-w-6xl px-4 md:px-16 py-20">
        <div className="grid grid-cols-1 gap-8 rounded-[var(--radius-card)] border border-surface-variant bg-surface-container-lowest p-8 sm:grid-cols-3">
          <div className="flex flex-col items-center gap-3 sm:col-span-1">
            <div className="flex h-28 w-28 items-center justify-center rounded-full bg-primary-container font-heading text-3xl font-bold text-on-primary-container">
              {siteConfig.director
                .split(" ")
                .slice(-2)
                .map((p) => p[0])
                .join("")}
            </div>
            <p className="text-center font-heading font-semibold text-on-surface">{siteConfig.director}</p>
            <p className="text-center text-sm text-on-surface-variant">{siteConfig.directorTitle}</p>
          </div>
          <div className="sm:col-span-2">
            <Badge variant="warning">Nội dung placeholder</Badge>
            <p className="mt-3 text-sm text-on-surface-variant">
              Tiểu sử chi tiết, chứng chỉ và thành tích của chủ nhiệm chương trình sẽ được Royal Public
              Speaking Club cập nhật tại đây. Vui lòng liên hệ đăng ký tư vấn để tìm hiểu thêm.
            </p>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      {testimonials.length > 0 && (
        <section className="bg-surface-container-low py-20">
          <div className="mx-auto max-w-6xl px-4 md:px-16">
            <h2 className="font-headline-lg-mobile md:font-headline-lg text-headline-lg-mobile md:text-headline-lg text-on-surface">
              Phản hồi
            </h2>
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
      <section className="mx-auto max-w-4xl px-4 md:px-16 py-20 text-center">
        <h2 className="font-headline-lg text-headline-lg text-on-surface">
          Sẵn sàng để con bạn Speak to Lead?
        </h2>
        <p className="mt-3 text-on-surface-variant">
          Đăng ký tư vấn ngay hôm nay để đội ngũ Royal Public Speaking Club đồng hành cùng con.
        </p>
        <Button asChild size="lg" variant="primary" className="mt-6">
          <Link href="/dang-ky-tu-van">Đăng ký tư vấn miễn phí</Link>
        </Button>
      </section>
    </>
  );
}
