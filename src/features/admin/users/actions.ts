"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireRole } from "@/lib/auth/session";
import type { ActionState } from "@/features/auth/actions";

const createUserSchema = z.object({
  email: z.string().email("Email không hợp lệ"),
  fullName: z.string().min(2, "Họ tên cần ít nhất 2 ký tự").max(100),
  role: z.enum(["student", "parent", "teacher", "admin"]),
});

function randomTempPassword(): string {
  return Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2).toUpperCase() + "!9";
}

export async function createUserAction(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  await requireRole("admin");

  const parsed = createUserSchema.safeParse({
    email: formData.get("email"),
    fullName: formData.get("fullName"),
    role: formData.get("role"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Dữ liệu không hợp lệ." };

  const admin = createAdminClient();
  const tempPassword = randomTempPassword();

  const { data, error } = await admin.auth.admin.createUser({
    email: parsed.data.email,
    password: tempPassword,
    email_confirm: true,
    user_metadata: { full_name: parsed.data.fullName, role: parsed.data.role },
  });

  if (error || !data.user) {
    return { error: `Không thể tạo tài khoản: ${error?.message ?? "lỗi không xác định"}` };
  }

  if (parsed.data.role === "student") {
    await admin.from("student_profiles").upsert({ profile_id: data.user.id });
  } else if (parsed.data.role === "parent") {
    await admin.from("parent_profiles").upsert({ profile_id: data.user.id });
  } else if (parsed.data.role === "teacher") {
    await admin.from("teacher_profiles").upsert({ profile_id: data.user.id });
  }

  revalidatePath("/admin/nguoi-dung");
  return {
    success: `Đã tạo tài khoản ${parsed.data.email}. Mật khẩu tạm thời: ${tempPassword} (vui lòng đổi ngay sau khi đăng nhập).`,
  };
}

export async function toggleUserStatusAction(userId: string, newStatus: "active" | "locked"): Promise<ActionState> {
  await requireRole("admin");
  const supabase = await createClient();
  const { error } = await supabase.from("profiles").update({ status: newStatus }).eq("id", userId);
  if (error) return { error: "Không thể cập nhật trạng thái tài khoản." };
  revalidatePath("/admin/nguoi-dung");
  return { success: newStatus === "locked" ? "Đã khóa tài khoản." : "Đã kích hoạt tài khoản." };
}

export async function updateUserRoleAction(userId: string, newRole: "student" | "parent" | "teacher" | "admin"): Promise<ActionState> {
  await requireRole("admin");
  const supabase = await createClient();
  const { error } = await supabase.from("profiles").update({ role: newRole }).eq("id", userId);
  if (error) return { error: "Không thể cập nhật vai trò." };

  const admin = createAdminClient();
  if (newRole === "student") await admin.from("student_profiles").upsert({ profile_id: userId });
  if (newRole === "parent") await admin.from("parent_profiles").upsert({ profile_id: userId });
  if (newRole === "teacher") await admin.from("teacher_profiles").upsert({ profile_id: userId });

  revalidatePath("/admin/nguoi-dung");
  return { success: "Đã cập nhật vai trò." };
}

const linkSchema = z.object({
  parentProfileId: z.string().uuid(),
  studentProfileId: z.string().uuid(),
});

export async function linkParentStudentAction(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  await requireRole("admin");
  const parsed = linkSchema.safeParse({
    parentProfileId: formData.get("parentProfileId"),
    studentProfileId: formData.get("studentProfileId"),
  });
  if (!parsed.success) return { error: "Vui lòng chọn phụ huynh và học viên hợp lệ." };

  const supabase = await createClient();
  const { error } = await supabase.from("parent_student_links").upsert(
    { parent_profile_id: parsed.data.parentProfileId, student_profile_id: parsed.data.studentProfileId, status: "active" },
    { onConflict: "parent_profile_id,student_profile_id" },
  );
  if (error) return { error: "Không thể liên kết phụ huynh với học viên." };

  revalidatePath("/admin/phu-huynh");
  revalidatePath("/admin/hoc-vien");
  return { success: "Đã liên kết phụ huynh với học viên." };
}

export async function unlinkParentStudentAction(linkId: string): Promise<ActionState> {
  await requireRole("admin");
  const supabase = await createClient();
  const { error } = await supabase.from("parent_student_links").delete().eq("id", linkId);
  if (error) return { error: "Không thể hủy liên kết." };
  revalidatePath("/admin/phu-huynh");
  return { success: "Đã hủy liên kết." };
}
