"use server";

import { requireRole } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { awardXp } from "@/features/gamification/engine";
import { getPracticeItem } from "@/config/practice";
import { XP_RULES } from "@/config/gamification";

export interface PracticeActionState {
  awarded: boolean;
  message: string;
}

/**
 * Ghi nhận một lượt luyện tập tự đánh giá (không có chấm AI thật trong MVP).
 * Giới hạn tối đa 1 lần nhận XP cho mỗi bài luyện / mỗi ngày để tránh lạm dụng.
 */
export async function completePracticeSessionAction(practiceSlug: string): Promise<PracticeActionState> {
  const user = await requireRole("student");
  const item = getPracticeItem(practiceSlug);
  if (!item) return { awarded: false, message: "Không tìm thấy bài luyện tập." };
  if (!item.xpEligible) return { awarded: false, message: "Đã ghi nhận lượt luyện tập." };

  const supabase = await createClient();
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const { data: existing } = await supabase
    .from("xp_transactions")
    .select("id")
    .eq("student_profile_id", user.id)
    .eq("reason_code", "practice_submit")
    .eq("note", practiceSlug)
    .gte("created_at", startOfDay.toISOString())
    .limit(1)
    .maybeSingle();

  if (existing) {
    return { awarded: false, message: "Bạn đã nhận XP cho bài luyện này hôm nay rồi. Cứ luyện tập thêm nhé!" };
  }

  await awardXp(user.id, XP_RULES.practiceSubmit, "practice_submit", {
    referenceType: "manual",
    note: practiceSlug,
  });

  return { awarded: true, message: `Tuyệt vời! Bạn nhận được ${XP_RULES.practiceSubmit} XP.` };
}
