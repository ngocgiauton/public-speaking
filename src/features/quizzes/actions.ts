"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireRole } from "@/lib/auth/session";
import { submitQuizSchema } from "@/features/quizzes/schema";
import { awardXp, notify } from "@/features/gamification/engine";
import { XP_RULES } from "@/config/gamification";

export interface QuizResult {
  score: number;
  isPassed: boolean;
  perQuestion: { questionId: string; isCorrect: boolean; pointsEarned: number }[];
}

export interface SubmitQuizActionState {
  error?: string;
  result?: QuizResult;
}

export async function submitQuizAttemptAction(
  input: unknown,
): Promise<SubmitQuizActionState> {
  const user = await requireRole("student");
  const parsed = submitQuizSchema.safeParse(input);
  if (!parsed.success) {
    return { error: "Dữ liệu bài làm không hợp lệ." };
  }
  const { quizId, lessonId, answers } = parsed.data;

  const supabase = await createClient();

  const { data: quiz } = await supabase.from("quizzes").select("*").eq("id", quizId).eq("is_published", true).maybeSingle();
  if (!quiz) return { error: "Không tìm thấy quiz." };

  const { data: questions } = await supabase.from("quiz_questions").select("*").eq("quiz_id", quizId);
  if (!questions || questions.length === 0) return { error: "Quiz chưa có câu hỏi." };

  const questionIds = questions.map((q) => q.id);
  const { data: options } = await supabase.from("quiz_options").select("*").in("question_id", questionIds);

  const { count: previousAttempts } = await supabase
    .from("quiz_attempts")
    .select("id", { count: "exact", head: true })
    .eq("quiz_id", quizId)
    .eq("student_profile_id", user.id);

  if (quiz.max_attempts != null && (previousAttempts ?? 0) >= quiz.max_attempts) {
    return { error: "Bạn đã đạt số lần làm bài tối đa cho quiz này." };
  }

  const { data: previousPassed } = await supabase
    .from("quiz_attempts")
    .select("id")
    .eq("quiz_id", quizId)
    .eq("student_profile_id", user.id)
    .eq("is_passed", true)
    .limit(1)
    .maybeSingle();

  const optionsByQuestion = new Map<string, typeof options>();
  for (const option of options ?? []) {
    const list = optionsByQuestion.get(option.question_id) ?? [];
    list.push(option);
    optionsByQuestion.set(option.question_id, list);
  }

  const answerByQuestion = new Map(answers.map((a) => [a.questionId, a.selectedOptionIds]));

  let totalScore = 0;
  const perQuestion: QuizResult["perQuestion"] = [];

  for (const question of questions) {
    const questionOptions = optionsByQuestion.get(question.id) ?? [];
    const correctIds = new Set(questionOptions.filter((o) => o.is_correct).map((o) => o.id));
    const selected = answerByQuestion.get(question.id) ?? [];

    let isCorrect = false;
    if (question.question_type === "ordering") {
      const correctOrder = [...questionOptions].sort((a, b) => a.order_index - b.order_index).map((o) => o.id);
      isCorrect = selected.length === correctOrder.length && selected.every((id, i) => id === correctOrder[i]);
    } else {
      const selectedSet = new Set(selected);
      isCorrect =
        selectedSet.size === correctIds.size && [...selectedSet].every((id) => correctIds.has(id));
    }

    const pointsEarned = isCorrect ? question.points : 0;
    totalScore += pointsEarned;
    perQuestion.push({ questionId: question.id, isCorrect, pointsEarned });
  }

  const isPassed = totalScore >= quiz.pass_score;

  const { data: attempt, error: attemptError } = await supabase
    .from("quiz_attempts")
    .insert({
      quiz_id: quizId,
      student_profile_id: user.id,
      attempt_number: (previousAttempts ?? 0) + 1,
      score: totalScore,
      is_passed: isPassed,
      submitted_at: new Date().toISOString(),
    })
    .select("id")
    .single();

  if (attemptError || !attempt) {
    return { error: "Không thể lưu bài làm. Vui lòng thử lại." };
  }

  await supabase.from("quiz_answers").insert(
    perQuestion.map((pq) => ({
      attempt_id: attempt.id,
      question_id: pq.questionId,
      selected_option_ids: answerByQuestion.get(pq.questionId) ?? [],
      is_correct: pq.isCorrect,
      points_earned: pq.pointsEarned,
    })),
  );

  if (isPassed) {
    const admin = createAdminClient();
    await admin.from("student_lesson_progress").upsert(
      {
        student_profile_id: user.id,
        lesson_id: lessonId,
        status: "in_progress",
        quiz_passed: true,
      },
      { onConflict: "student_profile_id,lesson_id" },
    );

    if (!previousPassed) {
      await awardXp(user.id, XP_RULES.quizComplete, "quiz_complete", {
        referenceType: "quiz",
        referenceId: quizId,
      });
      await notify(
        user.id,
        "Hoàn thành quiz",
        `Bạn đã đạt ${totalScore}/100 điểm và nhận ${XP_RULES.quizComplete} XP.`,
        "success",
      );
    }
  }

  revalidatePath(`/student/bai-hoc/${lessonId}`);

  return { result: { score: totalScore, isPassed, perQuestion } };
}
