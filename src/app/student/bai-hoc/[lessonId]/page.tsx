import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Clock, Sparkles } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UnauthorizedState } from "@/components/shared/error-state";
import { VideoPlayer } from "@/components/learning/video-player";
import { QuizRenderer } from "@/components/learning/quiz-renderer";
import { getCurrentUser } from "@/lib/auth/session";
import { getLessonDetail } from "@/lib/data/student";
import { markKnowledgeCompleteAction } from "@/features/progress/actions";
import { LOCK_REASON_LABELS_VI } from "@/features/progress/unlock";

export const metadata: Metadata = { title: "Bài học", robots: { index: false } };

export default async function LessonDetailPage({
  params,
}: {
  params: Promise<{ lessonId: string }>;
}) {
  const { lessonId } = await params;
  const user = await getCurrentUser();
  const detail = await getLessonDetail(user!.id, lessonId);

  if (!detail) notFound();

  if (!detail.isUnlocked) {
    return (
      <div className="mx-auto max-w-2xl">
        <UnauthorizedState />
        {detail.lockReasons.length > 0 && (
          <ul className="mt-4 flex flex-wrap justify-center gap-2">
            {detail.lockReasons.map((r) => (
              <li key={r} className="rounded-full bg-muted px-3 py-1 text-sm">
                {LOCK_REASON_LABELS_VI[r]}
              </li>
            ))}
          </ul>
        )}
        <div className="mt-6 text-center">
          <Button asChild variant="outline">
            <Link href="/student/lo-trinh">Quay lại lộ trình</Link>
          </Button>
        </div>
      </div>
    );
  }

  const { lesson, sections, quiz, questions, optionsByQuestion, assignment, progress, videoWatch } = detail;
  const knowledgeDone = Boolean(progress?.knowledge_completed);

  async function markKnowledgeDone() {
    "use server";
    await markKnowledgeCompleteAction(lessonId);
  }

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      <PageHeader
        title={`Buổi ${lesson.session_number}: ${lesson.title}`}
        breadcrumbs={[
          { label: "Lộ trình của tôi", href: "/student/lo-trinh" },
          { label: `Buổi ${lesson.session_number}` },
        ]}
        actions={
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" /> {lesson.duration_minutes} phút
            <Badge variant="gold">
              <Sparkles className="h-3 w-3" /> {lesson.xp_reward} XP
            </Badge>
          </div>
        }
      />

      {lesson.video_url && (
        <Card>
          <CardHeader>
            <CardTitle>Video bài giảng</CardTitle>
          </CardHeader>
          <CardContent>
            <VideoPlayer
              lessonId={lesson.id}
              videoUrl={lesson.video_url}
              thresholdPercent={lesson.video_watch_threshold_percent}
              initialCompleted={Boolean(videoWatch?.completed)}
            />
          </CardContent>
        </Card>
      )}

      {sections.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Kiến thức cốt lõi</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-5">
            {sections.map((section) => (
              <article key={section.id} className="flex flex-col gap-2">
                <h3 className="font-heading font-semibold">{section.title}</h3>
                <p className="text-sm text-foreground/90">{section.body}</p>
                {section.example_correct && (
                  <p className="text-sm text-brand-success">✓ Ví dụ đúng: {section.example_correct}</p>
                )}
                {section.example_incorrect && (
                  <p className="text-sm text-brand-error">✗ Ví dụ sai: {section.example_incorrect}</p>
                )}
                {section.memory_tip && (
                  <p className="text-sm text-muted-foreground">💡 Mẹo ghi nhớ: {section.memory_tip}</p>
                )}
                {section.common_mistake && (
                  <p className="text-sm text-brand-warning">⚠ Lỗi thường gặp: {section.common_mistake}</p>
                )}
              </article>
            ))}
            <form action={markKnowledgeDone}>
              <Button type="submit" variant={knowledgeDone ? "outline" : "primary"} disabled={knowledgeDone}>
                {knowledgeDone ? "Đã hoàn thành kiến thức" : "Đánh dấu đã đọc xong"}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {quiz && questions.length > 0 && (
        <div>
          <h2 className="mb-3 font-heading text-lg font-bold">Quiz: {quiz.title}</h2>
          {quiz.instructions && <p className="mb-3 text-sm text-muted-foreground">{quiz.instructions}</p>}
          <QuizRenderer quiz={quiz} lessonId={lesson.id} questions={questions} optionsByQuestion={optionsByQuestion} />
        </div>
      )}

      {assignment && (
        <Card>
          <CardHeader>
            <CardTitle>Bài tập chính: {assignment.title}</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <p className="text-sm text-muted-foreground">{assignment.description}</p>
            <Button asChild>
              <Link href={`/student/bai-tap/${assignment.id}`}>Làm bài tập</Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
