import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowRight, Clock, Eye, Lightbulb, Smile, Sparkles, Star, Users } from "lucide-react";
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

const KEY_POINT_ICONS = [Eye, Users, Smile, Lightbulb, Star];

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
  const keyTakeaways = Array.isArray(lesson.key_takeaways) ? (lesson.key_takeaways as string[]) : [];

  async function markKnowledgeDone() {
    "use server";
    await markKnowledgeCompleteAction(lessonId);
  }

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6">
      <PageHeader
        title={`Buổi ${lesson.session_number}: ${lesson.title}`}
        breadcrumbs={[
          { label: "Lộ trình của tôi", href: "/student/lo-trinh" },
          { label: `Buổi ${lesson.session_number}` },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <Badge variant="error">
              <Clock className="h-3 w-3" /> {lesson.duration_minutes} phút
            </Badge>
            <Badge variant="gold">
              <Sparkles className="h-3 w-3" /> {lesson.xp_reward} XP
            </Badge>
          </div>
        }
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="flex flex-col gap-6 lg:col-span-2">
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
              <CardContent className="flex flex-col gap-6">
                {sections.map((section) => (
                  <article key={section.id} className="flex flex-col gap-2">
                    <h3 className="font-headline-md text-headline-md text-on-surface">{section.title}</h3>
                    <p className="font-body-md text-body-md text-on-surface-variant">{section.body}</p>
                    {section.example_correct && (
                      <p className="text-sm text-brand-success">✓ Ví dụ đúng: {section.example_correct}</p>
                    )}
                    {section.example_incorrect && (
                      <p className="text-sm text-brand-error">✗ Ví dụ sai: {section.example_incorrect}</p>
                    )}
                    {section.memory_tip && (
                      <p className="text-sm text-on-surface-variant">💡 Mẹo ghi nhớ: {section.memory_tip}</p>
                    )}
                    {section.common_mistake && (
                      <p className="text-sm text-brand-warning">⚠ Lỗi thường gặp: {section.common_mistake}</p>
                    )}
                  </article>
                ))}
              </CardContent>
            </Card>
          )}

          {quiz && questions.length > 0 && (
            <div>
              <h2 className="mb-3 font-headline-md text-headline-md text-on-surface">Quiz: {quiz.title}</h2>
              {quiz.instructions && (
                <p className="mb-3 font-body-md text-body-md text-on-surface-variant">{quiz.instructions}</p>
              )}
              <QuizRenderer
                quiz={quiz}
                lessonId={lesson.id}
                questions={questions}
                optionsByQuestion={optionsByQuestion}
              />
            </div>
          )}

          {assignment && (
            <Card>
              <CardHeader>
                <CardTitle>Bài tập chính: {assignment.title}</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-3">
                <p className="text-sm text-on-surface-variant">{assignment.description}</p>
                <Button asChild>
                  <Link href={`/student/bai-tap/${assignment.id}`}>Làm bài tập</Link>
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="flex flex-col gap-6">
          {keyTakeaways.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lightbulb className="h-5 w-5 text-tertiary" aria-hidden="true" />
                  Điểm chính
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-3">
                {keyTakeaways.map((point, index) => {
                  const Icon = KEY_POINT_ICONS[index % KEY_POINT_ICONS.length];
                  return (
                    <div
                      key={point}
                      className="flex items-start gap-3 rounded-[var(--radius-control)] border border-surface-variant bg-surface-container-low p-3"
                    >
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-tertiary-container text-on-tertiary-container">
                        <Icon className="h-4 w-4" aria-hidden="true" />
                      </div>
                      <p className="font-label-md text-label-md text-on-surface">{point}</p>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          )}

          {sections.length > 0 && (
            <Card className="border-2 border-primary-container">
              <CardHeader>
                <CardTitle>Sẵn sàng đi tiếp chưa?</CardTitle>
              </CardHeader>
              <CardContent>
                <form action={markKnowledgeDone}>
                  <Button
                    type="submit"
                    variant={knowledgeDone ? "outline" : "primary"}
                    disabled={knowledgeDone}
                    className="w-full"
                  >
                    {knowledgeDone ? "Đã hoàn thành kiến thức" : "Đánh dấu đã đọc xong"}
                    {!knowledgeDone && <ArrowRight className="h-4 w-4" aria-hidden="true" />}
                  </Button>
                </form>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
