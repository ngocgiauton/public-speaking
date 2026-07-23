"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth/session";
import { lessonFormSchema, linesToJsonArray } from "@/features/admin/lessons/schema";
import type { ActionState } from "@/features/auth/actions";

function parseLessonForm(formData: FormData) {
  return lessonFormSchema.safeParse({
    courseLevelId: formData.get("courseLevelId"),
    sessionNumber: formData.get("sessionNumber"),
    slug: formData.get("slug"),
    title: formData.get("title"),
    shortDescription: formData.get("shortDescription") || undefined,
    durationMinutes: formData.get("durationMinutes"),
    videoUrl: formData.get("videoUrl") || undefined,
    xpReward: formData.get("xpReward"),
    objectives: formData.get("objectives") || undefined,
    keyTakeaways: formData.get("keyTakeaways") || undefined,
    isPublished: formData.get("isPublished") ? "true" : "false",
  });
}

export async function createLessonAction(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  await requireRole("admin");
  const parsed = parseLessonForm(formData);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Dữ liệu không hợp lệ." };

  const supabase = await createClient();
  const { error } = await supabase.from("lessons").insert({
    course_level_id: parsed.data.courseLevelId,
    session_number: parsed.data.sessionNumber,
    slug: parsed.data.slug,
    title: parsed.data.title,
    short_description: parsed.data.shortDescription || null,
    duration_minutes: parsed.data.durationMinutes,
    video_url: parsed.data.videoUrl || null,
    xp_reward: parsed.data.xpReward,
    objectives: JSON.stringify(linesToJsonArray(parsed.data.objectives ?? "")),
    key_takeaways: JSON.stringify(linesToJsonArray(parsed.data.keyTakeaways ?? "")),
    is_published: parsed.data.isPublished === "true",
  });

  if (error) return { error: "Không thể tạo bài học (session_number hoặc slug có thể đã tồn tại)." };

  revalidatePath("/admin/bai-hoc");
  return { success: "Đã tạo bài học." };
}

export async function updateLessonAction(lessonId: string, _prevState: ActionState, formData: FormData): Promise<ActionState> {
  await requireRole("admin");
  const parsed = parseLessonForm(formData);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Dữ liệu không hợp lệ." };

  const supabase = await createClient();
  const { error } = await supabase
    .from("lessons")
    .update({
      course_level_id: parsed.data.courseLevelId,
      session_number: parsed.data.sessionNumber,
      slug: parsed.data.slug,
      title: parsed.data.title,
      short_description: parsed.data.shortDescription || null,
      duration_minutes: parsed.data.durationMinutes,
      video_url: parsed.data.videoUrl || null,
      xp_reward: parsed.data.xpReward,
      objectives: JSON.stringify(linesToJsonArray(parsed.data.objectives ?? "")),
      key_takeaways: JSON.stringify(linesToJsonArray(parsed.data.keyTakeaways ?? "")),
      is_published: parsed.data.isPublished === "true",
    })
    .eq("id", lessonId);

  if (error) return { error: "Không thể cập nhật bài học." };

  revalidatePath("/admin/bai-hoc");
  revalidatePath(`/admin/bai-hoc/${lessonId}`);
  redirect("/admin/bai-hoc");
}

export async function toggleLessonPublishAction(lessonId: string, isPublished: boolean): Promise<ActionState> {
  await requireRole("admin");
  const supabase = await createClient();
  const { error } = await supabase.from("lessons").update({ is_published: isPublished }).eq("id", lessonId);
  if (error) return { error: "Không thể cập nhật trạng thái xuất bản." };
  revalidatePath("/admin/bai-hoc");
  return { success: isPublished ? "Đã xuất bản bài học." : "Đã ẩn bài học." };
}
