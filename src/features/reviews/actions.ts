"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth/session";
import { submitReviewSchema } from "@/features/reviews/schema";
import { validateRubricScores, sumRubricScore, normalizeRubricScoreTo100 } from "@/features/reviews/rubric";
import { canTransitionSubmission } from "@/features/submissions/status";
import { getSubmissionForGrading, verifyTeacherOwnsStudent } from "@/lib/data/teacher";
import { computeAssignmentApprovalXp, sumXpAwards } from "@/features/xp/xp";
import { awardXp, evaluateBadgesForApprovedSubmission, notify } from "@/features/gamification/engine";
import { syncLessonCompletionAfterReview } from "@/features/progress/actions";

export interface ReviewActionState {
  error?: string;
  success?: string;
}

export async function submitReviewAction(input: unknown): Promise<ReviewActionState> {
  const user = await requireRole("teacher");
  const parsed = submitReviewSchema.safeParse(input);
  if (!parsed.success) return { error: "Dữ liệu chấm điểm không hợp lệ." };

  const { submissionId, decision, overallComment, strengths, improvements, scores, bonusXp } = parsed.data;

  const context = await getSubmissionForGrading(submissionId);
  if (!context) return { error: "Không tìm thấy bài nộp." };

  const isOwner = await verifyTeacherOwnsStudent(user.id, context.submission.student_profile_id);
  if (!isOwner) return { error: "Bạn không có quyền chấm bài này." };

  if (!["submitted", "under_review", "resubmitted"].includes(context.submission.status)) {
    return { error: "Bài nộp này không ở trạng thái chờ chấm." };
  }

  const rubricErrors = validateRubricScores(scores);
  if (rubricErrors.length > 0) {
    return { error: rubricErrors[0].message };
  }

  const maxTotal = context.rubricCriteria.reduce((sum, c) => sum + c.max_score, 0);
  const totalScore = sumRubricScore(scores);
  if (totalScore > maxTotal) {
    return { error: `Tổng điểm không được vượt quá ${maxTotal}.` };
  }

  const supabase = await createClient();

  const { data: review, error: reviewError } = await supabase
    .from("submission_reviews")
    .insert({
      submission_id: submissionId,
      teacher_profile_id: user.id,
      overall_comment: overallComment || null,
      strengths: strengths || null,
      improvements: improvements || null,
      decision,
      total_score: totalScore,
    })
    .select("id")
    .single();

  if (reviewError || !review) return { error: "Không thể lưu kết quả chấm bài." };

  const scoreRows = context.rubricCriteria
    .filter((c) => scores[c.criterion_key] != null)
    .map((c) => ({
      submission_review_id: review.id,
      criterion_key: c.criterion_key,
      group_key: c.group_key,
      score: scores[c.criterion_key],
      max_score: c.max_score,
    }));

  if (scoreRows.length > 0) {
    await supabase.from("submission_scores").insert(scoreRows);
  }

  const normalizedScore = normalizeRubricScoreTo100(
    scores,
    context.rubricCriteria.map((c) => c.criterion_key),
  );

  const nextStatus = decision;
  if (!canTransitionSubmission(context.submission.status, nextStatus)) {
    return { error: "Không thể chuyển trạng thái bài nộp." };
  }

  await supabase
    .from("submissions")
    .update({
      status: nextStatus,
      best_score:
        decision === "approved"
          ? Math.max(normalizedScore, context.submission.best_score ?? 0)
          : context.submission.best_score,
    })
    .eq("id", submissionId);

  await supabase
    .from("student_lesson_progress")
    .update({ assignment_status: nextStatus })
    .eq("student_profile_id", context.submission.student_profile_id)
    .eq("lesson_id", context.lesson.id);

  if (decision === "approved") {
    const awards = computeAssignmentApprovalXp({
      score: normalizedScore,
      dueAt: context.submission.due_at,
      submittedAt: context.submission.submitted_at ?? new Date().toISOString(),
      previousBestScore: context.previousBestScore,
    });
    const totalXp = sumXpAwards(awards) + bonusXp;

    for (const award of awards) {
      await awardXp(context.submission.student_profile_id, award.amount, award.reason, {
        referenceType: "submission",
        referenceId: submissionId,
      });
    }
    if (bonusXp > 0) {
      await awardXp(context.submission.student_profile_id, bonusXp, "teacher_bonus", {
        referenceType: "submission",
        referenceId: submissionId,
        createdBy: user.id,
      });
    }

    await evaluateBadgesForApprovedSubmission(
      context.submission.student_profile_id,
      scoreRows.map((s) => ({ criterionKey: s.criterion_key, score: s.score })),
      normalizedScore,
    );

    await syncLessonCompletionAfterReview(context.submission.student_profile_id, context.lesson.id);

    await notify(
      context.submission.student_profile_id,
      "Bài tập đã được duyệt!",
      `Bài "${context.assignment.title}" đạt ${normalizedScore}/100 điểm và nhận ${totalXp} XP.`,
      "success",
      `/student/ket-qua/${submissionId}`,
    );
  } else if (decision === "revision_requested") {
    await notify(
      context.submission.student_profile_id,
      "Cần làm lại bài tập",
      `Giáo viên yêu cầu bạn làm lại bài "${context.assignment.title}". Xem phản hồi chi tiết để cải thiện nhé!`,
      "warning",
      `/student/bai-tap/${context.assignment.id}`,
    );
  } else {
    await notify(
      context.submission.student_profile_id,
      "Bài tập chưa đạt",
      `Bài "${context.assignment.title}" chưa đạt yêu cầu. Xem phản hồi và thử nộp lại nhé.`,
      "warning",
      `/student/ket-qua/${submissionId}`,
    );
  }

  revalidatePath("/teacher/bai-cho-cham");
  redirect("/teacher/bai-cho-cham");
}
