import { requireRole } from "@/lib/auth/session";
import type { UserRole } from "@/types/database";

/**
 * Bọc quanh layout của từng khu vực riêng tư (student/parent/teacher/admin).
 * Đây là lớp phòng vệ thứ hai — RLS ở Supabase vẫn là lớp bảo vệ dữ liệu
 * chính. Chuyển hướng về /dang-nhap nếu chưa đăng nhập, hoặc về dashboard
 * đúng vai trò nếu sai vai trò.
 */
export async function RoleGuard({
  roles,
  children,
}: {
  roles: UserRole[];
  children: React.ReactNode;
}) {
  await requireRole(...roles);
  return <>{children}</>;
}
