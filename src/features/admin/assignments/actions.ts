"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth/session";
import { assignmentFormSchema, ALL_RUBRIC_CRITERIA } from "@/features/admin/assignments/schema";
import type { ActionState } from "@/features/auth/actions";

function parseAssignmentForm(formData: FormData) {
  const parsed = assignmentFormSchema.safeParse({
    lessonId: formData.get("lessonId"),
    title: formData.get("title"),
    description: formData.get("description") || undefined,
    instructions: formData.get("instructions") || undefined,
    assignmentType: formData.get("assignmentType"),
    allowedVideo: formData.get("allowedVideo") || undefined,
    allowedAudio: formData.get("allowedAudio") || undefined,
    maxVideoMb: formData.get("maxVideoMb"),
    maxAudioMb: formData.get("maxAudioMb"),
    dueOffsetDays: formData.get("dueOffsetDays") || undefined,
    minPassScore: formData.get("minPassScore"),
    xpReward: formData.get("xpReward"),
    criteria: formData.getAll("criteria").map(String),
    isPublished: formData.get("isPublished") ? "true" : "false",
  });
  return parsed;
}

async function saveRubricCriteria(supabase: Awaited<ReturnType<typeof createClient>>, assignmentId: string, criteriaKeys: string[]) {
  await supabase.from("assignment_rubric_criteria").delete().eq("assignment_id", assignmentId);
  const rows = ALL_RUBRIC_CRITERIA.filter((c) => criteriaKeys.includes(c.key)).map((c, index) => ({
    assignment_id: assignmentId,
    criterion_key: c.key,
    group_key: c.groupKey,
    label: c.label,
    max_score: c.maxScore,
    order_index: index,
  }));
  if (rows.length > 0) await supabase.from("assignment_rubric_criteria").insert(rows);
}

export async function createAssignmentAction(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  await requireRole("admin");
  const parsed = parseAssignmentForm(formData);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Dữ liệu không hợp lệ." };

  const allowedMedia = [parsed.data.allowedVideo ? "video" : null, parsed.data.allowedAudio ? "audio" : null].filter(Boolean);
  if (allowedMedia.length === 0) return { error: "Cần cho phép ít nhất một định dạng (video hoặc âm thanh)." };

  const supabase = await createClient();
  const { data: assignment, error } = await supabase
    .from("assignments")
    .insert({
      lesson_id: parsed.data.lessonId,
      title: parsed.data.title,
      description: parsed.data.description || null,
      instructions: parsed.data.instructions || null,
      assignment_type: parsed.data.assignmentType,
      allowed_media: allowedMedia,
      max_video_mb: parsed.data.maxVideoMb,
      max_audio_mb: parsed.data.maxAudioMb,
      due_offset_days: parsed.data.dueOffsetDays || null,
      min_pass_score: parsed.data.minPassScore,
      xp_reward: parsed.data.xpReward,
      is_published: parsed.data.isPublished === "true",
    })
    .select("id")
    .single();

  if (error || !assignment) return { error: "Không thể tạo bài tập." };

  await saveRubricCriteria(supabase, assignment.id, parsed.data.criteria ?? []);

  revalidatePath("/admin/bai-tap");
  return { success: "Đã tạo bài tập." };
}

export async function updateAssignmentAction(assignmentId: string, _prevState: ActionState, formData: FormData): Promise<ActionState> {
  await requireRole("admin");
  const parsed = parseAssignmentForm(formData);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Dữ liệu không hợp lệ." };

  const allowedMedia = [parsed.data.allowedVideo ? "video" : null, parsed.data.allowedAudio ? "audio" : null].filter(Boolean);
  if (allowedMedia.length === 0) return { error: "Cần cho phép ít nhất một định dạng (video hoặc âm thanh)." };

  const supabase = await createClient();
  const { error } = await supabase
    .from("assignments")
    .update({
      lesson_id: parsed.data.lessonId,
      title: parsed.data.title,
      description: parsed.data.description || null,
      instructions: parsed.data.instructions || null,
      assignment_type: parsed.data.assignmentType,
      allowed_media: allowedMedia,
      max_video_mb: parsed.data.maxVideoMb,
      max_audio_mb: parsed.data.maxAudioMb,
      due_offset_days: parsed.data.dueOffsetDays || null,
      min_pass_score: parsed.data.minPassScore,
      xp_reward: parsed.data.xpReward,
      is_published: parsed.data.isPublished === "true",
    })
    .eq("id", assignmentId);

  if (error) return { error: "Không thể cập nhật bài tập." };

  await saveRubricCriteria(supabase, assignmentId, parsed.data.criteria ?? []);

  revalidatePath("/admin/bai-tap");
  redirect("/admin/bai-tap");
}

export async function toggleAssignmentPublishAction(assignmentId: string, isPublished: boolean): Promise<ActionState> {
  await requireRole("admin");
  const supabase = await createClient();
  const { error } = await supabase.from("assignments").update({ is_published: isPublished }).eq("id", assignmentId);
  if (error) return { error: "Không thể cập nhật trạng thái." };
  revalidatePath("/admin/bai-tap");
  return { success: "Đã cập nhật." };
}
