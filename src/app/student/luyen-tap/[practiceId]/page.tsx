import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PracticeTimer } from "@/components/learning/practice-timer";
import { getPracticeItem } from "@/config/practice";

export const metadata: Metadata = { title: "Luyện tập", robots: { index: false } };

export default async function PracticeDetailPage({
  params,
}: {
  params: Promise<{ practiceId: string }>;
}) {
  const { practiceId } = await params;
  const item = getPracticeItem(practiceId);
  if (!item) notFound();

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6">
      <PageHeader
        title={item.name}
        breadcrumbs={[
          { label: "Phòng luyện tập", href: "/student/luyen-tap" },
          { label: item.name },
        ]}
        actions={<Badge variant="royal">{item.skill}</Badge>}
      />

      <Card>
        <CardContent className="p-5">
          <p className="text-sm font-medium">Hướng dẫn</p>
          <p className="mt-1 text-sm text-muted-foreground">{item.instructions}</p>
        </CardContent>
      </Card>

      <PracticeTimer durationSeconds={item.durationSeconds} practiceSlug={item.slug} />
    </div>
  );
}
