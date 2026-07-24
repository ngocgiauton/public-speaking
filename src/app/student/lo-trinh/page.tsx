import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/page-header";
import { JourneyNode } from "@/components/learning/journey-node";
import { EmptyState } from "@/components/shared/empty-state";
import { Badge } from "@/components/ui/badge";
import { getCurrentUser } from "@/lib/auth/session";
import { getStudentJourney } from "@/lib/data/student";

export const metadata: Metadata = { title: "Lộ trình của tôi", robots: { index: false } };

export default async function StudentJourneyPage() {
  const user = await getCurrentUser();
  const journey = await getStudentJourney(user!.id);

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      <PageHeader
        title="Lộ trình của tôi"
        description="Theo dõi hành trình 22 buổi học qua 6 giai đoạn."
        breadcrumbs={[{ label: "Tổng quan", href: "/student" }, { label: "Lộ trình của tôi" }]}
      />

      {!journey || journey.length === 0 ? (
        <EmptyState title="Chưa có lộ trình" description="Vui lòng liên hệ quản trị viên để được xếp lớp." />
      ) : (
        <div className="flex flex-col gap-8">
          {journey.map((level) => (
            <section key={level.id}>
              <div className="mb-3 flex items-center gap-3">
                <Badge variant="royal">Level {level.orderIndex}</Badge>
                <h2 className="font-headline-md text-headline-md text-on-surface">{level.name}</h2>
              </div>
              <div className="relative flex flex-col gap-3 border-l-2 border-tertiary/30 pl-4">
                {level.lessons.map((item) => (
                  <JourneyNode key={item.lesson.id} item={item} />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
