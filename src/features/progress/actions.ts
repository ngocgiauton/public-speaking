"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireRole } from "@/lib/auth/session";
import { hasWatchedEnough } from "@/features/progress/unlock";
import { awardXp, evaluateBadgesForLessonComplete, notify } from "@/features/gamification/engine";
import { getStreakBonusXp } from "@/features/xp/xp";
import { XP_RULES } from "@/config/gamification";

async function recordDailyActivity(studentProfileId: string): Promise<void> {
  const supabase = await createClient();
  const today = new Date().toISOString().slice(0, 10);

  const { error } = await supabase
    .from("streaks")
    .upsert({ student_profile_id: studentProfileId, activity_date: today }, { onConflict: "student_profile_id,activity_date", ignoreDuplicates: true });
  if (error) return;

  const { data: recentDays } = await supabase
    .from("streaks")
    .select("activity_date")
    .eq("student_profile_id", studentProfileId)
    .order("activity_date", { ascending: false })
    .limit(30);

  let streak = 0;
  const cursor = new Date();
  for (const day of recentDays ?? []) {
    const dayStr = day.activity_date;
    const expected = cursor.toISOString().slice(0, 10);
    if (dayStr === expected) {
      streak++;
      cursor.setDate(cursor.getDate() - 1);
    } else {
      break;
    }
  }

  const admin = createAdminClient();
  const { data: currentProfile } = await admin
    .from("student_profiles")
    .select("longest_streak_days")
    .eq("profile_id", studentProfileId)
    .single();

  await admin
    .from("student_profiles")
    .update({
      current_streak_days: streak,
      longest_streak_days: Math.max(streak, currentProfile?.longest_streak_days ?? 0),
      last_active_date: today,
    })
    .eq("profile_id", studentProfileId);

  const bonus = getStreakBonusXp(streak);
  if (bonus > 0) {
    await awardXp(studentProfileId, bonus, streak % 7 === 0 ? "streak_7_days" : "streak_3_days", {
      referenceType: "streak",
    });
  }
}

async function syncLessonCompletion(studentProfileId: string, lessonId: string): Promise<void> {
  const supabase = await createClient();
  const admin = createAdminClient();

  const { data: lesson } = await supabase.from("lessons").select("*").eq("id", lessonId).single();
  const { data: progress } = await supabase
    .from("student_lesson_progress")
    .select("*")
    .eq("student_profile_id", studentProfileId)
    .eq("lesson_id", lessonId)
    .maybeSingle();

  const { data: quiz } = await supabase.from("quizzes").select("id").eq("lesson_id", lessonId).maybeSingle();
  const { data: assignment } = await supabase.from("assignments").select("id, min_pass_score").eq("lesson_id", lessonId).maybeSingle();

  const videoDone = Boolean(progress?.video_completed);
  const knowledgeDone = Boolean(progress?.knowledge_completed);
  const quizDone = quiz ? Boolean(progress?.quiz_passed) : true;
  const assignmentDone = assignment ? progress?.assignment_status === "approved" : true;

  if (videoDone && knowledgeDone && quizDone && assignmentDone && progress?.status !== "completed") {
    await admin
      .from("student_lesson_progress")
      .update({ status: "completed", completed_at: new Date().toISOString() })
      .eq("student_profile_id", studentProfileId)
      .eq("lesson_id", lessonId);

    if (lesson) {
      await evaluateBadgesForLessonComplete(studentProfileId, lesson.session_number);
    }
  }
}

export async function updateVideoWatchProgressAction(
  lessonId: string,
  watchedSeconds: number,
  totalSeconds: number,
): Promise<void> {
  const user = await requireRole("student");
  const supabase = await createClient();

  const { data: lesson } = await supabase
    .from("lessons")
    .select("video_watch_threshold_percent")
    .eq("id", lessonId)
    .single();

  const watchPercent = totalSeconds > 0 ? Math.round((watchedSeconds / totalSeconds) * 100) : 0;
  const threshold = lesson?.video_watch_threshold_percent ?? 80;
  const completed = hasWatchedEnough(watchPercent, threshold);

  const { data: existing } = await supabase
    .from("video_watch_progress")
    .select("completed")
    .eq("student_profile_id", user.id)
    .eq("lesson_id", lessonId)
    .maybeSingle();

  await supabase.from("video_watch_progress").upsert(
    {
      student_profile_id: user.id,
      lesson_id: lessonId,
      watched_seconds: Math.round(watchedSeconds),
      total_seconds: Math.round(totalSeconds),
      watch_percent: watchPercent,
      completed,
    },
    { onConflict: "student_profile_id,lesson_id" },
  );

  if (completed && !existing?.completed) {
    const admin = createAdminClient();
    await admin.from("student_lesson_progress").upsert(
      { student_profile_id: user.id, lesson_id: lessonId, status: "in_progress", video_completed: true },
      { onConflict: "student_profile_id,lesson_id" },
    );
    await awardXp(user.id, XP_RULES.lessonVideoComplete, "lesson_video_complete", {
      referenceType: "lesson",
      referenceId: lessonId,
    });
    await recordDailyActivity(user.id);
    await syncLessonCompletion(user.id, lessonId);
    revalidatePath(`/student/bai-hoc/${lessonId}`);
    revalidatePath("/student");
  }
}

export async function markKnowledgeCompleteAction(lessonId: string): Promise<void> {
  const user = await requireRole("student");

  const supabase = await createClient();
  const { data: existing } = await supabase
    .from("student_lesson_progress")
    .select("knowledge_completed")
    .eq("student_profile_id", user.id)
    .eq("lesson_id", lessonId)
    .maybeSingle();

  if (existing?.knowledge_completed) return;

  const admin = createAdminClient();
  await admin.from("student_lesson_progress").upsert(
    { student_profile_id: user.id, lesson_id: lessonId, status: "in_progress", knowledge_completed: true },
    { onConflict: "student_profile_id,lesson_id" },
  );

  await awardXp(user.id, XP_RULES.knowledgeComplete, "knowledge_complete", {
    referenceType: "lesson",
    referenceId: lessonId,
  });
  await recordDailyActivity(user.id);
  await syncLessonCompletion(user.id, lessonId);
  revalidatePath(`/student/bai-hoc/${lessonId}`);
  revalidatePath("/student");
}

export async function syncLessonCompletionAfterReview(studentProfileId: string, lessonId: string): Promise<void> {
  await syncLessonCompletion(studentProfileId, lessonId);
}

export async function notifyStudent(
  studentProfileId: string,
  title: string,
  body: string,
  type: "info" | "success" | "warning" | "grading" | "badge" | "system" = "info",
  link?: string,
): Promise<void> {
  await notify(studentProfileId, title, body, type, link);
}
