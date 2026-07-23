import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { JourneyNode } from "@/components/learning/journey-node";
import { ProgressLineChart } from "@/components/charts/progress-line-chart";
import { EmptyState } from "@/components/shared/empty-state";
import { UnauthorizedState } from "@/components/shared/error-state";
import { getCurrentUser } from "@/lib/auth/session";
import { verifyParentOwnsStudent, getXpHistory, getScoreHistory } from "@/lib/data/parent";
import { getStudentJourney } from "@/lib/data/student";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Tiến độ học viên", robots: { index: false } };

export default async function ParentStudentProgressPage({
  params,
}: {
  params: Promise<{ studentId: string }>;
}) {
  const { studentId } = await params;
  const user = await getCurrentUser();

  const isOwner = await verifyParentOwnsStudent(user!.id, studentId);
  if (!isOwner) return <UnauthorizedState />;

  const supabase = await createClient();
  const { data: profile } = await supabase.from("profiles").select("full_name").eq("id", studentId).single();

  const [journey, xpHistory, scoreHistory] = await Promise.all([
    getStudentJourney(studentId),
    getXpHistory(studentId),
    getScoreHistory(studentId),
  ]);

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      <PageHeader
        title={`Tiến độ của ${profile?.full_name ?? ""}`}
        breadcrumbs={[{ label: "Tổng quan", href: "/parent" }, { label: "Tiến độ" }]}
      />

      <Card>
        <CardHeader>
          <CardTitle>XP tích lũy theo thời gian</CardTitle>
        </CardHeader>
        <CardContent>
          {xpHistory.length === 0 ? (
            <EmptyState title="Chưa có dữ liệu XP" />
          ) : (
            <ProgressLineChart data={xpHistory} dataKey="cumulativeXp" label="XP tích lũy" />
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Lịch sử điểm bài nói</CardTitle>
        </CardHeader>
        <CardContent>
          {scoreHistory.length === 0 ? (
            <EmptyState title="Chưa có bài nói nào được chấm" />
          ) : (
            <ProgressLineChart data={scoreHistory} dataKey="score" label="Điểm" color="#f59e0b" />
          )}
        </CardContent>
      </Card>

      <div>
        <h2 className="mb-3 font-heading text-lg font-bold">Lộ trình học</h2>
        <div className="flex flex-col gap-8">
          {(journey ?? []).map((level) => (
            <section key={level.id}>
              <div className="mb-3 flex items-center gap-3">
                <Badge variant="royal">Level {level.orderIndex}</Badge>
                <h3 className="font-heading font-semibold">{level.name}</h3>
              </div>
              <div className="flex flex-col gap-3">
                {level.lessons.map((item) => (
                  <JourneyNode key={item.lesson.id} item={item} readOnly />
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
