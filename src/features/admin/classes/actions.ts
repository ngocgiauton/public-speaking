"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth/session";
import { createClassSchema, assignTeacherSchema, enrollStudentSchema } from "@/features/admin/classes/schema";
import type { ActionState } from "@/features/auth/actions";

export async function createClassAction(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  await requireRole("admin");
  const parsed = createClassSchema.safeParse({
    courseId: formData.get("courseId"),
    name: formData.get("name"),
    startDate: formData.get("startDate") || undefined,
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Dữ liệu không hợp lệ." };

  const supabase = await createClient();
  const { error } = await supabase.from("classes").insert({
    course_id: parsed.data.courseId,
    name: parsed.data.name,
    start_date: parsed.data.startDate || null,
  });
  if (error) return { error: "Không thể tạo lớp học." };

  revalidatePath("/admin/lop-hoc");
  return { success: "Đã tạo lớp học." };
}

export async function archiveClassAction(classId: string): Promise<ActionState> {
  await requireRole("admin");
  const supabase = await createClient();
  const { error } = await supabase.from("classes").update({ status: "archived" }).eq("id", classId);
  if (error) return { error: "Không thể lưu trữ lớp học." };
  revalidatePath("/admin/lop-hoc");
  return { success: "Đã lưu trữ lớp học." };
}

export async function assignTeacherToClassAction(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  await requireRole("admin");
  const parsed = assignTeacherSchema.safeParse({
    classId: formData.get("classId"),
    teacherProfileId: formData.get("teacherProfileId"),
  });
  if (!parsed.success) return { error: "Vui lòng chọn lớp và giáo viên hợp lệ." };

  const supabase = await createClient();
  const { error } = await supabase
    .from("class_teachers")
    .upsert(
      { class_id: parsed.data.classId, teacher_profile_id: parsed.data.teacherProfileId, role: "main" },
      { onConflict: "class_id,teacher_profile_id" },
    );
  if (error) return { error: "Không thể phân công giáo viên." };

  revalidatePath("/admin/lop-hoc");
  revalidatePath("/admin/giao-vien");
  return { success: "Đã phân công giáo viên vào lớp." };
}

export async function enrollStudentAction(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  await requireRole("admin");
  const parsed = enrollStudentSchema.safeParse({
    classId: formData.get("classId"),
    studentProfileId: formData.get("studentProfileId"),
  });
  if (!parsed.success) return { error: "Vui lòng chọn lớp và học viên hợp lệ." };

  const supabase = await createClient();
  const { error } = await supabase
    .from("class_enrollments")
    .upsert(
      { class_id: parsed.data.classId, student_profile_id: parsed.data.studentProfileId, status: "active" },
      { onConflict: "class_id,student_profile_id" },
    );
  if (error) return { error: "Không thể ghi danh học viên." };

  revalidatePath("/admin/lop-hoc");
  revalidatePath("/admin/hoc-vien");
  return { success: "Đã ghi danh học viên vào lớp." };
}
