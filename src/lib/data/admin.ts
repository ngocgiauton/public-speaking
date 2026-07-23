import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { LeadStatus, ProfileStatus, UserRole } from "@/types/database";

export interface AdminDashboardStats {
  totalUsers: number;
  activeStudents: number;
  teacherCount: number;
  activeClasses: number;
  completionRate: number;
  pendingReviewCount: number;
  leadCount: number;
  newLeadsThisWeek: number;
}

export async function getAdminDashboardStats(): Promise<AdminDashboardStats> {
  const supabase = await createClient();

  const [
    { count: totalUsers },
    { count: activeStudents },
    { count: teacherCount },
    { count: activeClasses },
    { count: pendingReviewCount },
    { count: leadCount },
    { data: progressRows },
  ] = await Promise.all([
    supabase.from("profiles").select("id", { count: "exact", head: true }),
    supabase.from("profiles").select("id", { count: "exact", head: true }).eq("role", "student").eq("status", "active"),
    supabase.from("profiles").select("id", { count: "exact", head: true }).eq("role", "teacher"),
    supabase.from("classes").select("id", { count: "exact", head: true }).eq("status", "active"),
    supabase.from("submissions").select("id", { count: "exact", head: true }).in("status", ["submitted", "under_review", "resubmitted"]),
    supabase.from("consultation_leads").select("id", { count: "exact", head: true }),
    supabase.from("student_lesson_progress").select("status"),
  ]);

  const sevenDaysAgo = new Date(Date.now() - 7 * 86400000).toISOString();
  const { count: newLeadsThisWeek } = await supabase
    .from("consultation_leads")
    .select("id", { count: "exact", head: true })
    .gte("created_at", sevenDaysAgo);

  const total = progressRows?.length ?? 0;
  const completed = progressRows?.filter((p) => p.status === "completed").length ?? 0;

  return {
    totalUsers: totalUsers ?? 0,
    activeStudents: activeStudents ?? 0,
    teacherCount: teacherCount ?? 0,
    activeClasses: activeClasses ?? 0,
    completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
    pendingReviewCount: pendingReviewCount ?? 0,
    leadCount: leadCount ?? 0,
    newLeadsThisWeek: newLeadsThisWeek ?? 0,
  };
}

export interface ListParams {
  search?: string;
  page?: number;
  pageSize?: number;
}

export interface PagedResult<T> {
  rows: T[];
  totalCount: number;
  page: number;
  pageSize: number;
}

export async function listUsers(params: ListParams & { role?: string; status?: string }): Promise<
  PagedResult<{ id: string; full_name: string; role: string; status: string; phone: string | null; created_at: string }>
> {
  const supabase = await createClient();
  const page = params.page ?? 1;
  const pageSize = params.pageSize ?? 20;
  const from = (page - 1) * pageSize;

  let query = supabase.from("profiles").select("id, full_name, role, status, phone, created_at", { count: "exact" });

  if (params.role) query = query.eq("role", params.role as UserRole);
  if (params.status) query = query.eq("status", params.status as ProfileStatus);
  if (params.search) query = query.ilike("full_name", `%${params.search}%`);

  const { data, count } = await query.order("created_at", { ascending: false }).range(from, from + pageSize - 1);

  return { rows: data ?? [], totalCount: count ?? 0, page, pageSize };
}

export async function listClassesAdmin(): Promise<
  { id: string; name: string; status: string; courseTitle: string; studentCount: number }[]
> {
  const supabase = await createClient();
  const { data: classes } = await supabase.from("classes").select("*").order("created_at", { ascending: false });
  const courseIds = [...new Set((classes ?? []).map((c) => c.course_id))];
  const { data: courses } = courseIds.length
    ? await supabase.from("courses").select("id, title").in("id", courseIds)
    : { data: [] };
  const courseById = new Map((courses ?? []).map((c) => [c.id, c.title]));

  const { data: enrollments } = await supabase.from("class_enrollments").select("class_id").eq("status", "active");
  const countByClass = new Map<string, number>();
  for (const e of enrollments ?? []) countByClass.set(e.class_id, (countByClass.get(e.class_id) ?? 0) + 1);

  return (classes ?? []).map((c) => ({
    id: c.id,
    name: c.name,
    status: c.status,
    courseTitle: courseById.get(c.course_id) ?? "",
    studentCount: countByClass.get(c.id) ?? 0,
  }));
}

export async function listCourses() {
  const supabase = await createClient();
  const { data } = await supabase.from("courses").select("*").order("created_at", { ascending: false });
  return data ?? [];
}

export async function listCourseLevels(courseId?: string) {
  const supabase = await createClient();
  let query = supabase.from("course_levels").select("*").order("order_index", { ascending: true });
  if (courseId) query = query.eq("course_id", courseId);
  const { data } = await query;
  return data ?? [];
}

export async function listLessonsAdmin() {
  const supabase = await createClient();
  const { data: lessons } = await supabase.from("lessons").select("*").order("session_number", { ascending: true });
  const levelIds = [...new Set((lessons ?? []).map((l) => l.course_level_id))];
  const { data: levels } = levelIds.length
    ? await supabase.from("course_levels").select("id, name").in("id", levelIds)
    : { data: [] };
  const levelById = new Map((levels ?? []).map((l) => [l.id, l.name]));

  return (lessons ?? []).map((l) => ({ ...l, levelName: levelById.get(l.course_level_id) ?? "" }));
}

export async function listQuizzesAdmin() {
  const supabase = await createClient();
  const { data: quizzes } = await supabase.from("quizzes").select("*").order("created_at", { ascending: false });
  const lessonIds = [...new Set((quizzes ?? []).map((q) => q.lesson_id))];
  const { data: lessons } = lessonIds.length
    ? await supabase.from("lessons").select("id, title, session_number").in("id", lessonIds)
    : { data: [] };
  const lessonById = new Map((lessons ?? []).map((l) => [l.id, l]));

  return (quizzes ?? []).map((q) => ({
    ...q,
    lessonTitle: lessonById.get(q.lesson_id)?.title ?? "",
    lessonSessionNumber: lessonById.get(q.lesson_id)?.session_number ?? 0,
  }));
}

export async function listAssignmentsAdmin() {
  const supabase = await createClient();
  const { data: assignments } = await supabase.from("assignments").select("*").order("created_at", { ascending: false });
  const lessonIds = [...new Set((assignments ?? []).map((a) => a.lesson_id))];
  const { data: lessons } = lessonIds.length
    ? await supabase.from("lessons").select("id, title, session_number").in("id", lessonIds)
    : { data: [] };
  const lessonById = new Map((lessons ?? []).map((l) => [l.id, l]));

  return (assignments ?? []).map((a) => ({
    ...a,
    lessonTitle: lessonById.get(a.lesson_id)?.title ?? "",
    lessonSessionNumber: lessonById.get(a.lesson_id)?.session_number ?? 0,
  }));
}

export async function listBadgesAdmin() {
  const supabase = await createClient();
  const { data } = await supabase.from("badges").select("*").order("created_at", { ascending: true });
  return data ?? [];
}

export async function listCertificatesAdmin() {
  const supabase = await createClient();
  const { data } = await supabase.from("certificates").select("*").order("created_at", { ascending: false });
  return data ?? [];
}

export async function listLeadsAdmin(status?: string) {
  const supabase = await createClient();
  let query = supabase.from("consultation_leads").select("*").order("created_at", { ascending: false });
  if (status) query = query.eq("status", status as LeadStatus);
  const { data } = await query;
  return data ?? [];
}

export async function listFaqItemsAdmin() {
  const supabase = await createClient();
  const { data } = await supabase.from("faq_items").select("*").order("order_index", { ascending: true });
  return data ?? [];
}

export async function listTestimonialsAdmin() {
  const supabase = await createClient();
  const { data } = await supabase.from("testimonials").select("*").order("order_index", { ascending: true });
  return data ?? [];
}

export async function getSiteSettingsAdmin() {
  const supabase = await createClient();
  const { data } = await supabase.from("site_settings").select("*");
  return data ?? [];
}

export async function listProfilesByRole(role: "student" | "parent" | "teacher" | "admin") {
  const supabase = await createClient();
  const { data } = await supabase.from("profiles").select("id, full_name").eq("role", role).order("full_name");
  return data ?? [];
}

export async function listStudentsAdmin() {
  const supabase = await createClient();
  const { data: profiles } = await supabase.from("profiles").select("id, full_name, status").eq("role", "student").order("full_name");
  const studentIds = (profiles ?? []).map((p) => p.id);
  if (studentIds.length === 0) return [];

  const { data: studentProfiles } = await supabase
    .from("student_profiles")
    .select("profile_id, total_xp, current_streak_days")
    .in("profile_id", studentIds);
  const spById = new Map((studentProfiles ?? []).map((sp) => [sp.profile_id, sp]));

  const { data: ranks } = await supabase.from("student_ranks").select("student_profile_id, rank_slug").in("student_profile_id", studentIds);
  const rankById = new Map((ranks ?? []).map((r) => [r.student_profile_id, r.rank_slug]));

  const { data: links } = await supabase.from("parent_student_links").select("student_profile_id").eq("status", "active").in("student_profile_id", studentIds);
  const parentCountByStudent = new Map<string, number>();
  for (const l of links ?? []) parentCountByStudent.set(l.student_profile_id, (parentCountByStudent.get(l.student_profile_id) ?? 0) + 1);

  return (profiles ?? []).map((p) => ({
    id: p.id,
    fullName: p.full_name,
    status: p.status,
    totalXp: spById.get(p.id)?.total_xp ?? 0,
    streak: spById.get(p.id)?.current_streak_days ?? 0,
    rankSlug: rankById.get(p.id) ?? "beginner-speaker",
    parentCount: parentCountByStudent.get(p.id) ?? 0,
  }));
}

export async function listParentsAdmin() {
  const supabase = await createClient();
  const { data: profiles } = await supabase.from("profiles").select("id, full_name, phone").eq("role", "parent").order("full_name");
  const parentIds = (profiles ?? []).map((p) => p.id);
  if (parentIds.length === 0) return [];

  const { data: links } = await supabase
    .from("parent_student_links")
    .select("id, parent_profile_id, student_profile_id")
    .in("parent_profile_id", parentIds)
    .eq("status", "active");

  const studentIds = [...new Set((links ?? []).map((l) => l.student_profile_id))];
  const { data: studentProfiles } = studentIds.length
    ? await supabase.from("profiles").select("id, full_name").in("id", studentIds)
    : { data: [] };
  const studentNameById = new Map((studentProfiles ?? []).map((s) => [s.id, s.full_name]));

  return (profiles ?? []).map((p) => ({
    id: p.id,
    fullName: p.full_name,
    phone: p.phone,
    linkedStudents: (links ?? [])
      .filter((l) => l.parent_profile_id === p.id)
      .map((l) => ({ linkId: l.id, studentId: l.student_profile_id, studentName: studentNameById.get(l.student_profile_id) ?? "" })),
  }));
}

export async function listTeachersAdmin() {
  const supabase = await createClient();
  const { data: profiles } = await supabase.from("profiles").select("id, full_name").eq("role", "teacher").order("full_name");
  const teacherIds = (profiles ?? []).map((p) => p.id);
  if (teacherIds.length === 0) return [];

  const { data: links } = await supabase.from("class_teachers").select("teacher_profile_id, class_id").in("teacher_profile_id", teacherIds);
  const classIds = [...new Set((links ?? []).map((l) => l.class_id))];
  const { data: classes } = classIds.length ? await supabase.from("classes").select("id, name").in("id", classIds) : { data: [] };
  const classNameById = new Map((classes ?? []).map((c) => [c.id, c.name]));

  return (profiles ?? []).map((p) => ({
    id: p.id,
    fullName: p.full_name,
    classes: (links ?? []).filter((l) => l.teacher_profile_id === p.id).map((l) => classNameById.get(l.class_id) ?? ""),
  }));
}

export interface AdminReportData {
  leadsByStatus: { bucket: string; count: number }[];
  submissionsByStatus: { bucket: string; count: number }[];
  averageGradingHours: number | null;
}

export async function getAdminReports(): Promise<AdminReportData> {
  const supabase = await createClient();

  const { data: leads } = await supabase.from("consultation_leads").select("status");
  const leadStatusLabels: Record<string, string> = {
    new: "Mới",
    contacted: "Đã liên hệ",
    consulting: "Đang tư vấn",
    registered: "Đã đăng ký",
    not_suitable: "Không phù hợp",
  };
  const leadCounts = new Map<string, number>();
  for (const l of leads ?? []) leadCounts.set(l.status, (leadCounts.get(l.status) ?? 0) + 1);

  const { data: submissions } = await supabase.from("submissions").select("status");
  const submissionStatusLabels: Record<string, string> = {
    draft: "Bản nháp",
    submitted: "Đã nộp",
    under_review: "Đang chấm",
    revision_requested: "Cần làm lại",
    resubmitted: "Đã nộp lại",
    approved: "Đã đạt",
    rejected: "Chưa đạt",
  };
  const submissionCounts = new Map<string, number>();
  for (const s of submissions ?? []) submissionCounts.set(s.status, (submissionCounts.get(s.status) ?? 0) + 1);

  const { data: reviews } = await supabase
    .from("submission_reviews")
    .select("submission_id, reviewed_at")
    .order("reviewed_at", { ascending: false })
    .limit(200);

  let averageGradingHours: number | null = null;
  if (reviews && reviews.length > 0) {
    const submissionIds = [...new Set(reviews.map((r) => r.submission_id))];
    const { data: relatedSubmissions } = await supabase
      .from("submissions")
      .select("id, submitted_at")
      .in("id", submissionIds);
    const submittedAtById = new Map((relatedSubmissions ?? []).map((s) => [s.id, s.submitted_at]));

    const durations: number[] = [];
    for (const r of reviews) {
      const submittedAt = submittedAtById.get(r.submission_id);
      if (submittedAt) {
        const hours = (new Date(r.reviewed_at).getTime() - new Date(submittedAt).getTime()) / 3_600_000;
        if (hours >= 0) durations.push(hours);
      }
    }
    if (durations.length > 0) {
      averageGradingHours = Math.round((durations.reduce((a, b) => a + b, 0) / durations.length) * 10) / 10;
    }
  }

  return {
    leadsByStatus: Object.entries(leadStatusLabels).map(([key, label]) => ({ bucket: label, count: leadCounts.get(key) ?? 0 })),
    submissionsByStatus: Object.entries(submissionStatusLabels).map(([key, label]) => ({ bucket: label, count: submissionCounts.get(key) ?? 0 })),
    averageGradingHours,
  };
}
