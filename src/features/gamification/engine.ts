import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import { getRankForXp } from "@/features/xp/xp";
import type { XpReasonCode } from "@/config/gamification";

/**
 * Mọi thay đổi XP/huy hiệu/rank đều đi qua các hàm ở đây, dùng service role
 * (bỏ qua RLS) — vì các bảng xp_transactions/student_badges/student_ranks
 * không cấp quyền ghi cho vai trò authenticated (xem docs/RLS.md). Các hàm
 * này chỉ được gọi từ server actions đã tự kiểm tra vai trò/logic nghiệp vụ
 * trước đó (ví dụ: sau khi quiz được chấm đúng ở server, hoặc giáo viên duyệt
 * bài).
 */

export async function awardXp(
  studentProfileId: string,
  amount: number,
  reasonCode: XpReasonCode,
  options?: { referenceType?: "lesson" | "quiz" | "assignment" | "submission" | "streak" | "manual"; referenceId?: string; note?: string; createdBy?: string },
): Promise<void> {
  if (amount === 0) return;
  const supabase = createAdminClient();
  const { error } = await supabase.from("xp_transactions").insert({
    student_profile_id: studentProfileId,
    amount,
    reason_code: reasonCode,
    reference_type: options?.referenceType ?? null,
    reference_id: options?.referenceId ?? null,
    note: options?.note ?? null,
    created_by: options?.createdBy ?? null,
  });
  if (error) throw error;

  await syncRank(studentProfileId);
}

export async function syncRank(studentProfileId: string): Promise<void> {
  const supabase = createAdminClient();
  const { data: profile } = await supabase
    .from("student_profiles")
    .select("total_xp")
    .eq("profile_id", studentProfileId)
    .single();

  const rank = getRankForXp(profile?.total_xp ?? 0);

  await supabase
    .from("student_ranks")
    .upsert({ student_profile_id: studentProfileId, rank_slug: rank.slug }, { onConflict: "student_profile_id" });

  if (rank.slug === "royal-speaker") {
    await awardBadgeIfMissing(studentProfileId, "royal-speaker");
  }
}

export async function awardBadgeIfMissing(studentProfileId: string, badgeSlug: string): Promise<void> {
  const supabase = createAdminClient();
  const { data: badge } = await supabase.from("badges").select("id").eq("slug", badgeSlug).maybeSingle();
  if (!badge) return;

  await supabase
    .from("student_badges")
    .upsert(
      { student_profile_id: studentProfileId, badge_id: badge.id },
      { onConflict: "student_profile_id,badge_id", ignoreDuplicates: true },
    );
}

export async function notify(
  recipientProfileId: string,
  title: string,
  body: string,
  type: "info" | "success" | "warning" | "grading" | "badge" | "system" = "info",
  link?: string,
): Promise<void> {
  const supabase = createAdminClient();
  await supabase.from("notifications").insert({
    recipient_profile_id: recipientProfileId,
    title,
    body,
    type,
    link: link ?? null,
  });
}

/** Đánh giá huy hiệu sau khi một bài học được đánh dấu hoàn thành. */
export async function evaluateBadgesForLessonComplete(
  studentProfileId: string,
  sessionNumber: number,
): Promise<void> {
  if (sessionNumber === 1) await awardBadgeIfMissing(studentProfileId, "first-speech");
  if (sessionNumber === 22) await awardBadgeIfMissing(studentProfileId, "speak-to-lead");
}

const SKILL_BADGE_MAP: Record<string, string> = {
  eye_contact: "eye-contact-starter",
  posture: "confident-posture",
  emotion: "great-smile",
  gesture: "gesture-master",
  volume: "voice-controller",
  pause: "pause-expert",
  storytelling: "story-builder",
  stage_command: "stage-explorer",
};

/** Đánh giá huy hiệu sau khi một bài nộp được giáo viên duyệt. */
export async function evaluateBadgesForApprovedSubmission(
  studentProfileId: string,
  criterionScores: { criterionKey: string; score: number }[],
  normalizedScore: number,
): Promise<void> {
  for (const { criterionKey, score } of criterionScores) {
    const badgeSlug = SKILL_BADGE_MAP[criterionKey];
    if (badgeSlug && score >= 4) {
      await awardBadgeIfMissing(studentProfileId, badgeSlug);
    }
  }

  if (normalizedScore >= 85) {
    await awardBadgeIfMissing(studentProfileId, "confident-speaker");
  }
}
