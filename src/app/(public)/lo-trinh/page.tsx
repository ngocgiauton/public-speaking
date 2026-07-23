import type { Metadata } from "next";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/shared/empty-state";
import { getPublishedCourseOverview } from "@/lib/data/public-content";

export const metadata: Metadata = {
  title: "Lộ trình 22 buổi",
  description: "Lộ trình học Public Speaking – Diễn Giả Nhí gồm 22 buổi, chia thành 6 level học thuật.",
};

export default async function JourneyPage() {
  const overview = await getPublishedCourseOverview();

  return (
    <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6">
      <h1 className="font-heading text-3xl font-bold">Lộ trình 22 buổi</h1>
      <p className="mt-4 text-muted-foreground">
        Chương trình <strong>{overview?.course.title ?? "Public Speaking – Diễn Giả Nhí"}</strong> gồm 22
        buổi học, chia thành 6 giai đoạn từ Khởi động đến Final Speaker.
      </p>

      {!overview ? (
        <div className="mt-8">
          <EmptyState
            title="Chưa tải được lộ trình chi tiết"
            description="Vui lòng cấu hình Supabase và chạy seed data để hiển thị đầy đủ 22 buổi học."
          />
        </div>
      ) : (
        <div className="mt-8 flex flex-col gap-8">
          {overview.levels.map((level) => (
            <section key={level.id}>
              <div className="flex items-center gap-3">
                <Badge variant="royal">Level {level.order_index}</Badge>
                <h2 className="font-heading text-xl font-bold">{level.name}</h2>
              </div>
              {level.description && <p className="mt-1 text-sm text-muted-foreground">{level.description}</p>}
              <ol className="mt-4 flex flex-col gap-2">
                {level.lessons.map((lesson) => (
                  <li
                    key={lesson.id}
                    className="flex items-center gap-3 rounded-[var(--radius-control)] border border-border p-3"
                  >
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted text-sm font-semibold">
                      {lesson.session_number}
                    </span>
                    <div>
                      <p className="font-medium">{lesson.title}</p>
                      {lesson.short_description && (
                        <p className="text-sm text-muted-foreground">{lesson.short_description}</p>
                      )}
                    </div>
                  </li>
                ))}
              </ol>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
