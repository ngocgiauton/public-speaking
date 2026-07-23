"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth/session";
import { createQuizSchema, addQuestionSchema, parseOptionsText } from "@/features/admin/quizzes/schema";
import type { ActionState } from "@/features/auth/actions";

export async function createQuizAction(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  await requireRole("admin");
  const parsed = createQuizSchema.safeParse({
    lessonId: formData.get("lessonId"),
    title: formData.get("title"),
    instructions: formData.get("instructions") || undefined,
    passScore: formData.get("passScore"),
    maxAttempts: formData.get("maxAttempts") || undefined,
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Dữ liệu không hợp lệ." };

  const supabase = await createClient();
  const { error } = await supabase.from("quizzes").insert({
    lesson_id: parsed.data.lessonId,
    title: parsed.data.title,
    instructions: parsed.data.instructions || null,
    pass_score: parsed.data.passScore,
    max_attempts: parsed.data.maxAttempts || null,
  });
  if (error) return { error: "Không thể tạo quiz." };

  revalidatePath("/admin/quiz");
  return { success: "Đã tạo quiz." };
}

export async function toggleQuizPublishAction(quizId: string, isPublished: boolean): Promise<ActionState> {
  await requireRole("admin");
  const supabase = await createClient();
  const { error } = await supabase.from("quizzes").update({ is_published: isPublished }).eq("id", quizId);
  if (error) return { error: "Không thể cập nhật trạng thái." };
  revalidatePath("/admin/quiz");
  return { success: "Đã cập nhật." };
}

export async function addQuestionAction(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  await requireRole("admin");
  const parsed = addQuestionSchema.safeParse({
    quizId: formData.get("quizId"),
    questionText: formData.get("questionText"),
    questionType: formData.get("questionType"),
    explanation: formData.get("explanation") || undefined,
    points: formData.get("points"),
    orderIndex: formData.get("orderIndex"),
    optionsText: formData.get("optionsText"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Dữ liệu không hợp lệ." };

  const options = parseOptionsText(parsed.data.optionsText);
  if (options.length < 2) return { error: "Cần ít nhất 2 đáp án." };
  if (parsed.data.questionType !== "ordering" && !options.some((o) => o.isCorrect)) {
    return { error: 'Vui lòng đánh dấu ít nhất một đáp án đúng bằng hậu tố "|correct".' };
  }

  const supabase = await createClient();
  const { data: question, error } = await supabase
    .from("quiz_questions")
    .insert({
      quiz_id: parsed.data.quizId,
      question_text: parsed.data.questionText,
      question_type: parsed.data.questionType,
      explanation: parsed.data.explanation || null,
      points: parsed.data.points,
      order_index: parsed.data.orderIndex,
    })
    .select("id")
    .single();

  if (error || !question) return { error: "Không thể tạo câu hỏi." };

  await supabase.from("quiz_options").insert(
    options.map((o, index) => ({
      question_id: question.id,
      option_text: o.optionText,
      is_correct: parsed.data.questionType === "ordering" ? false : o.isCorrect,
      order_index: index,
    })),
  );

  revalidatePath(`/admin/quiz/${parsed.data.quizId}`);
  return { success: "Đã thêm câu hỏi." };
}

export async function deleteQuestionAction(questionId: string, quizId: string): Promise<ActionState> {
  await requireRole("admin");
  const supabase = await createClient();
  const { error } = await supabase.from("quiz_questions").delete().eq("id", questionId);
  if (error) return { error: "Không thể xóa câu hỏi." };
  revalidatePath(`/admin/quiz/${quizId}`);
  return { success: "Đã xóa câu hỏi." };
}
