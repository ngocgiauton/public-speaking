import Link from "next/link";
import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SubmissionStatusBadge } from "@/components/gamification/submission-status-badge";
import { EmptyState } from "@/components/shared/empty-state";
import { getCurrentUser } from "@/lib/auth/session";
import { getStudentJourney } from "@/lib/data/student";
import type { SubmissionStatus } from "@/features/submissions/status";

export const metadata: Metadata = { title: "Bài tập", robots: { index: false } };

export default async function StudentAssignmentsPage() {
  const user = await getCurrentUser();
  const journey = await getStudentJourney(user!.id);
  const items = (journey ?? [])
    .flatMap((l) => l.lessons)
    .filter((jl) => jl.assignment && jl.displayStatus !== "locked");

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      <PageHeader title="Bài tập" breadcrumbs={[{ label: "Tổng quan", href: "/student" }, { label: "Bài tập" }]} />

      {items.length === 0 ? (
        <EmptyState title="Chưa có bài tập nào" description="Hãy tiếp tục học để mở khóa bài tập tiếp theo." />
      ) : (
        <div className="flex flex-col gap-3">
          {items.map((item) => {
            const status: SubmissionStatus =
              (item.progress?.assignment_status as SubmissionStatus) ?? "draft";
            const notStarted = !item.progress || item.progress.assignment_status === "not_submitted";
            return (
              <Card key={item.assignment!.id}>
                <CardContent className="flex items-center justify-between gap-4 p-5">
                  <div>
                    <p className="text-xs text-muted-foreground">Buổi {item.lesson.session_number}</p>
                    <p className="font-heading font-semibold">{item.assignment!.title}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    {!notStarted && <SubmissionStatusBadge status={status} />}
                    <Button asChild size="sm">
                      <Link href={`/student/bai-tap/${item.assignment!.id}`}>
                        {notStarted ? "Bắt đầu làm bài" : "Xem chi tiết"}
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
