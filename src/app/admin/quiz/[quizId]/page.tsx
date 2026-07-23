import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { SimpleActionForm } from "@/components/admin/simple-action-form";
import { DeleteQuestionButton } from "@/components/admin/delete-question-button";
import { addQuestionAction } from "@/features/admin/quizzes/actions";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Chi tiết quiz", robots: { index: false } };

export default async function AdminQuizDetailPage({
  params,
}: {
  params: Promise<{ quizId: string }>;
}) {
  const { quizId } = await params;
  const supabase = await createClient();
  const { data: quiz } = await supabase.from("quizzes").select("*").eq("id", quizId).maybeSingle();
  if (!quiz) notFound();

  const { data: questions } = await supabase
    .from("quiz_questions")
    .select("*")
    .eq("quiz_id", quizId)
    .order("order_index", { ascending: true });
  const { data: options } = await supabase
    .from("quiz_options")
    .select("*")
    .in("question_id", (questions ?? []).map((q) => q.id));
  const optionsByQuestion = new Map<string, typeof options>();
  for (const opt of options ?? []) {
    const list = optionsByQuestion.get(opt.question_id) ?? [];
    list.push(opt);
    optionsByQuestion.set(opt.question_id, list);
  }

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      <PageHeader
        title={quiz.title}
        breadcrumbs={[{ label: "Quiz", href: "/admin/quiz" }, { label: quiz.title }]}
        actions={<Badge variant={quiz.is_published ? "success" : "neutral"}>{quiz.is_published ? "Đã xuất bản" : "Nháp"}</Badge>}
      />

      <Card>
        <CardHeader>
          <CardTitle>Danh sách câu hỏi ({questions?.length ?? 0})</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          {(questions ?? []).map((q, i) => (
            <div key={q.id} className="rounded-[var(--radius-control)] border border-border p-3">
              <div className="flex items-start justify-between gap-2">
                <p className="text-sm font-medium">
                  Câu {i + 1}. {q.question_text}{" "}
                  <span className="text-xs text-muted-foreground">({q.question_type}, {q.points}đ)</span>
                </p>
                <DeleteQuestionButton questionId={q.id} quizId={quizId} />
              </div>
              <ul className="mt-1 flex flex-col gap-0.5 text-xs text-muted-foreground">
                {(optionsByQuestion.get(q.id) ?? []).map((o) => (
                  <li key={o.id}>
                    {o.is_correct ? "✓" : "•"} {o.option_text}
                  </li>
                ))}
              </ul>
            </div>
          ))}
          {(!questions || questions.length === 0) && (
            <p className="text-sm text-muted-foreground">Chưa có câu hỏi nào.</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Thêm câu hỏi</CardTitle>
        </CardHeader>
        <CardContent>
          <SimpleActionForm action={addQuestionAction} submitLabel="Thêm câu hỏi">
            <input type="hidden" name="quizId" value={quizId} />
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="questionText">Nội dung câu hỏi</Label>
              <Textarea id="questionText" name="questionText" required maxLength={500} />
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="questionType">Loại câu hỏi</Label>
                <Select id="questionType" name="questionType" required>
                  <option value="single_choice">Một đáp án</option>
                  <option value="multiple_choice">Nhiều đáp án</option>
                  <option value="true_false">Đúng/Sai</option>
                  <option value="ordering">Sắp xếp thứ tự</option>
                </Select>
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="points">Điểm</Label>
                <Input id="points" name="points" type="number" min={1} defaultValue={25} required />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="orderIndex">Thứ tự</Label>
                <Input id="orderIndex" name="orderIndex" type="number" min={0} defaultValue={(questions?.length ?? 0) + 1} required />
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="optionsText">
                Đáp án (mỗi dòng một đáp án; thêm <code>|correct</code> vào cuối dòng đáp án đúng. Với câu
                sắp xếp, thứ tự dòng là thứ tự đúng.)
              </Label>
              <Textarea
                id="optionsText"
                name="optionsText"
                rows={5}
                placeholder={"Đáp án A|correct\nĐáp án B\nĐáp án C"}
                required
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="explanation">Giải thích đáp án</Label>
              <Textarea id="explanation" name="explanation" maxLength={1000} />
            </div>
          </SimpleActionForm>
        </CardContent>
      </Card>
    </div>
  );
}
