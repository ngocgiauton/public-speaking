"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth/session";
import { saveDraftSchema, attachFileSchema } from "@/features/submissions/schema";
import { isEditableByStudent, canTransitionSubmission } from "@/features/submissions/status";
import { notify } from "@/features/gamification/engine";

export interface SubmissionActionState {
  error?: string;
  success?: string;
  submissionId?: string;
}

export async function ensureDraftSubmissionAction(assignmentId: string): Promise<SubmissionActionState> {
  const user = await requireRole("student");
  const supabase = await createClient();

  const { data: existing } = await supabase
    .from("submissions")
    .select("id, status")
    .eq("assignment_id", assignmentId)
    .eq("student_profile_id", user.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (existing && isEditableByStudent(existing.status)) {
    return { submissionId: existing.id };
  }
  if (existing) {
    // Đang trong quá trình chấm/đã đạt — không tạo bản nháp mới trùng.
    return { submissionId: existing.id };
  }

  const { data: assignment } = await supabase
    .from("assignments")
    .select("due_offset_days")
    .eq("id", assignmentId)
    .single();

  const dueAt = assignment?.due_offset_days
    ? new Date(Date.now() + assignment.due_offset_days * 86400000).toISOString()
    : null;

  const { data: created, error } = await supabase
    .from("submissions")
    .insert({ assignment_id: assignmentId, student_profile_id: user.id, status: "draft", due_at: dueAt })
    .select("id")
    .single();

  if (error || !created) return { error: "Không thể tạo bản nháp." };
  return { submissionId: created.id };
}

export async function saveDraftAction(input: unknown): Promise<SubmissionActionState> {
  const user = await requireRole("student");
  const parsed = saveDraftSchema.safeParse(input);
  if (!parsed.success) return { error: "Dữ liệu không hợp lệ." };

  const supabase = await createClient();
  const { submissionId, title, notes } = parsed.data;
  if (!submissionId) return { error: "Thiếu mã bài nộp." };

  const { data: submission } = await supabase
    .from("submissions")
    .select("status, student_profile_id")
    .eq("id", submissionId)
    .maybeSingle();

  if (!submission || submission.student_profile_id !== user.id) return { error: "Không tìm thấy bài nộp." };
  if (!isEditableByStudent(submission.status)) {
    return { error: "Bài đã nộp không thể chỉnh sửa. Vui lòng chờ giáo viên yêu cầu làm lại nếu cần." };
  }

  const { error } = await supabase
    .from("submissions")
    .update({ title: title || null, notes: notes || null })
    .eq("id", submissionId);

  if (error) return { error: "Không thể lưu bản nháp." };
  revalidatePath("/student/bai-tap");
  return { success: "Đã lưu bản nháp.", submissionId };
}

export async function attachSubmissionFileAction(input: unknown): Promise<SubmissionActionState> {
  const user = await requireRole("student");
  const parsed = attachFileSchema.safeParse(input);
  if (!parsed.success) return { error: "Dữ liệu file không hợp lệ." };

  const supabase = await createClient();
  const { submissionId, storagePath, fileType, originalFilename, mimeType, sizeBytes } = parsed.data;

  const { data: submission } = await supabase
    .from("submissions")
    .select("status, student_profile_id")
    .eq("id", submissionId)
    .maybeSingle();

  if (!submission || submission.student_profile_id !== user.id) return { error: "Không tìm thấy bài nộp." };
  if (!isEditableByStudent(submission.status)) return { error: "Không thể thêm file vào bài đã nộp." };

  const { error } = await supabase.from("submission_files").insert({
    submission_id: submissionId,
    file_type: fileType,
    storage_path: storagePath,
    original_filename: originalFilename,
    mime_type: mimeType,
    size_bytes: sizeBytes,
  });

  if (error) return { error: "Không thể lưu thông tin file." };
  revalidatePath("/student/bai-tap");
  return { success: "Đã tải file lên." };
}

export async function removeSubmissionFileAction(fileId: string, storagePath: string): Promise<SubmissionActionState> {
  const user = await requireRole("student");
  const supabase = await createClient();

  await supabase.storage.from("submission-media").remove([storagePath]);
  const { error } = await supabase.from("submission_files").delete().eq("id", fileId);

  if (error) return { error: "Không thể xóa file." };
  revalidatePath("/student/bai-tap");
  return { success: "Đã xóa file.", submissionId: user.id };
}

export async function submitAssignmentAction(submissionId: string): Promise<SubmissionActionState> {
  const user = await requireRole("student");
  const supabase = await createClient();

  const { data: submission } = await supabase
    .from("submissions")
    .select("*")
    .eq("id", submissionId)
    .maybeSingle();

  if (!submission || submission.student_profile_id !== user.id) return { error: "Không tìm thấy bài nộp." };

  const { data: files } = await supabase.from("submission_files").select("id").eq("submission_id", submissionId);
  if (!files || files.length === 0) {
    return { error: "Vui lòng tải lên ít nhất một video hoặc file âm thanh trước khi nộp bài." };
  }

  const nextStatus = submission.status === "draft" ? "submitted" : "resubmitted";
  if (!canTransitionSubmission(submission.status, nextStatus)) {
    return { error: "Trạng thái bài nộp hiện tại không cho phép nộp lại." };
  }

  const { error } = await supabase
    .from("submissions")
    .update({
      status: nextStatus,
      submitted_at: new Date().toISOString(),
      attempt_number: submission.attempt_number + (nextStatus === "resubmitted" ? 1 : 0),
    })
    .eq("id", submissionId);

  if (error) return { error: "Không thể nộp bài. Vui lòng thử lại." };

  const { data: assignment } = await supabase
    .from("assignments")
    .select("title, lesson_id")
    .eq("id", submission.assignment_id)
    .single();

  const { data: enrollments } = await supabase
    .from("class_enrollments")
    .select("class_id")
    .eq("student_profile_id", user.id);
  const classIds = (enrollments ?? []).map((e) => e.class_id);

  const { data: teacherLinks } = classIds.length
    ? await supabase.from("class_teachers").select("teacher_profile_id").in("class_id", classIds)
    : { data: [] };

  const teacherIds = [...new Set((teacherLinks ?? []).map((t) => t.teacher_profile_id))];
  for (const teacherId of teacherIds) {
    await notify(
      teacherId,
      "Có bài nộp mới cần chấm",
      `${user.profile.full_name} vừa nộp bài "${assignment?.title ?? ""}".`,
      "info",
      "/teacher/bai-cho-cham",
    );
  }

  revalidatePath("/student/bai-tap");
  return { success: "Nộp bài thành công! Giáo viên sẽ chấm và phản hồi sớm.", submissionId };
}
