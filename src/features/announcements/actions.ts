"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth/session";
import { createAnnouncementSchema } from "@/features/announcements/schema";
import { verifyTeacherOwnsClass } from "@/lib/data/teacher";
import { notify } from "@/features/gamification/engine";
import type { ActionState } from "@/features/auth/actions";

export async function createAnnouncementAction(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  const user = await requireRole("teacher");

  const parsed = createAnnouncementSchema.safeParse({
    classId: formData.get("classId"),
    title: formData.get("title"),
    body: formData.get("body"),
  });

  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Dữ liệu không hợp lệ." };

  const isOwner = await verifyTeacherOwnsClass(user.id, parsed.data.classId);
  if (!isOwner) return { error: "Bạn không phụ trách lớp này." };

  const supabase = await createClient();
  const { error } = await supabase.from("announcements").insert({
    class_id: parsed.data.classId,
    author_profile_id: user.id,
    title: parsed.data.title,
    body: parsed.data.body,
  });

  if (error) return { error: "Không thể gửi thông báo." };

  const { data: enrollments } = await supabase
    .from("class_enrollments")
    .select("student_profile_id")
    .eq("class_id", parsed.data.classId)
    .eq("status", "active");

  for (const e of enrollments ?? []) {
    await notify(e.student_profile_id, parsed.data.title, parsed.data.body, "info", "/student/thong-bao");
  }

  revalidatePath("/teacher/giao-bai");
  return { success: `Đã gửi thông báo tới ${enrollments?.length ?? 0} học viên.` };
}
