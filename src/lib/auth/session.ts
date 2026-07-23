import "server-only";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { ProfileRow, UserRole } from "@/types/database";

export interface CurrentUser {
  id: string;
  email: string | null;
  profile: ProfileRow;
}

/** Trả về user hiện tại + profile ứng dụng, hoặc null nếu chưa đăng nhập. */
export async function getCurrentUser(): Promise<CurrentUser | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile) return null;

  return { id: user.id, email: user.email ?? null, profile };
}

/**
 * Bắt buộc phải đăng nhập và có đúng vai trò để truy cập trang. Dùng ở đầu
 * mỗi layout khu vực riêng tư (student/parent/teacher/admin) — đây là lớp
 * phòng vệ thứ hai bên cạnh RLS, không thay thế RLS.
 */
export async function requireRole(...roles: UserRole[]): Promise<CurrentUser> {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/dang-nhap");
  }

  if (user.profile.status === "locked") {
    redirect("/dang-nhap?error=account_locked");
  }

  if (!roles.includes(user.profile.role)) {
    redirect(`/${user.profile.role}`);
  }

  return user;
}
