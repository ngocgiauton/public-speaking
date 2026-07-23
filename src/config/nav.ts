import type {
  LucideIcon,
} from "lucide-react";
import {
  Award,
  BarChart3,
  BookOpen,
  Bell,
  ClipboardList,
  FileText,
  GraduationCap,
  Home,
  LayoutDashboard,
  ListChecks,
  MessageSquare,
  Settings,
  ShieldCheck,
  Sparkles,
  Trophy,
  Users,
  UserCog,
  UserRound,
} from "lucide-react";

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

export const studentNav: NavItem[] = [
  { href: "/student", label: "Tổng quan", icon: LayoutDashboard },
  { href: "/student/lo-trinh", label: "Lộ trình của tôi", icon: BookOpen },
  { href: "/student/luyen-tap", label: "Phòng luyện tập", icon: Sparkles },
  { href: "/student/bai-tap", label: "Bài tập", icon: ClipboardList },
  { href: "/student/thanh-tich", label: "Thành tích", icon: Trophy },
  { href: "/student/chung-nhan", label: "Chứng nhận", icon: Award },
  { href: "/student/thong-bao", label: "Thông báo", icon: Bell },
  { href: "/student/ho-so", label: "Hồ sơ", icon: UserRound },
];

export const parentNav: NavItem[] = [
  { href: "/parent", label: "Tổng quan", icon: LayoutDashboard },
  { href: "/parent/thong-bao", label: "Thông báo", icon: Bell },
  { href: "/parent/ho-so", label: "Hồ sơ", icon: UserRound },
];

export const teacherNav: NavItem[] = [
  { href: "/teacher", label: "Tổng quan", icon: LayoutDashboard },
  { href: "/teacher/lop-hoc", label: "Lớp học", icon: GraduationCap },
  { href: "/teacher/bai-cho-cham", label: "Bài chờ chấm", icon: ListChecks },
  { href: "/teacher/giao-bai", label: "Giao bài", icon: FileText },
  { href: "/teacher/bao-cao", label: "Báo cáo", icon: BarChart3 },
  { href: "/teacher/thong-bao", label: "Thông báo", icon: Bell },
  { href: "/teacher/ho-so", label: "Hồ sơ", icon: UserRound },
];

export const adminNav: NavItem[] = [
  { href: "/admin", label: "Tổng quan", icon: LayoutDashboard },
  { href: "/admin/nguoi-dung", label: "Người dùng", icon: Users },
  { href: "/admin/lop-hoc", label: "Lớp học", icon: GraduationCap },
  { href: "/admin/khoa-hoc", label: "Khóa học", icon: BookOpen },
  { href: "/admin/bai-hoc", label: "Bài học", icon: FileText },
  { href: "/admin/quiz", label: "Quiz", icon: ListChecks },
  { href: "/admin/bai-tap", label: "Bài tập", icon: ClipboardList },
  { href: "/admin/rubric", label: "Rubric", icon: ShieldCheck },
  { href: "/admin/huy-hieu", label: "Huy hiệu", icon: Trophy },
  { href: "/admin/chung-nhan", label: "Chứng nhận", icon: Award },
  { href: "/admin/dang-ky-tu-van", label: "Đăng ký tư vấn", icon: MessageSquare },
  { href: "/admin/noi-dung", label: "Nội dung website", icon: Home },
  { href: "/admin/bao-cao", label: "Báo cáo", icon: BarChart3 },
  { href: "/admin/cai-dat", label: "Cài đặt", icon: Settings },
];

export const roleNavMap = {
  student: studentNav,
  parent: parentNav,
  teacher: teacherNav,
  admin: adminNav,
} as const;

export const roleLabels = {
  student: "Học viên",
  parent: "Phụ huynh",
  teacher: "Giáo viên",
  admin: "Quản trị viên",
} as const;

export const roleIcons: Record<keyof typeof roleLabels, LucideIcon> = {
  student: GraduationCap,
  parent: UserRound,
  teacher: UserCog,
  admin: ShieldCheck,
};
