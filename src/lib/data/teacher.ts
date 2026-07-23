import "server-only";
import { createClient } from "@/lib/supabase/server";

export interface TeacherClassSummary {
  id: string;
  name: string;
  status: string;
  startDate: string | null;
  courseTitle: string;
  studentCount: number;
}

export async function getTeacherClasses(teacherProfileId: string): Promise<TeacherClassSummary[]> {
  const supabase = await createClient();

  const { data: links } = await supabase
    .from("class_teachers")
    .select("class_id")
    .eq("teacher_profile_id", teacherProfileId);
  const classIds = (links ?? []).map((l) => l.class_id);
  if (classIds.length === 0) return [];

  const { data: classes } = await supabase.from("classes").select("*").in("id", classIds);
  const courseIds = [...new Set((classes ?? []).map((c) => c.course_id))];
  const { data: courses } = await supabase.from("courses").select("id, title").in("id", courseIds);
  const courseById = new Map((courses ?? []).map((c) => [c.id, c.title]));

  const { data: enrollments } = await supabase
    .from("class_enrollments")
    .select("class_id")
    .in("class_id", classIds)
    .eq("status", "active");
  const countByClass = new Map<string, number>();
  for (const e of enrollments ?? []) {
    countByClass.set(e.class_id, (countByClass.get(e.class_id) ?? 0) + 1);
  }

  return (classes ?? []).map((c) => ({
    id: c.id,
    name: c.name,
    status: c.status,
    startDate: c.start_date,
    courseTitle: courseById.get(c.course_id) ?? "",
    studentCount: countByClass.get(c.id) ?? 0,
  }));
}

export interface GradingQueueItem {
  submissionId: string;
  studentName: string;
  studentId: string;
  assignmentTitle: string;
  lessonSessionNumber: number;
  status: string;
  submittedAt: string | null;
  attemptNumber: number;
}

export async function getGradingQueue(teacherProfileId: string): Promise<GradingQueueItem[]> {
  const supabase = await createClient();

  const { data: links } = await supabase
    .from("class_teachers")
    .select("class_id")
    .eq("teacher_profile_id", teacherProfileId);
  const classIds = (links ?? []).map((l) => l.class_id);
  if (classIds.length === 0) return [];

  const { data: enrollments } = await supabase
    .from("class_enrollments")
    .select("student_profile_id")
    .in("class_id", classIds);
  const studentIds = [...new Set((enrollments ?? []).map((e) => e.student_profile_id))];
  if (studentIds.length === 0) return [];

  const { data: submissions } = await supabase
    .from("submissions")
    .select("*")
    .in("student_profile_id", studentIds)
    .in("status", ["submitted", "under_review", "resubmitted"])
    .order("submitted_at", { ascending: true });

  if (!submissions || submissions.length === 0) return [];

  const assignmentIds = [...new Set(submissions.map((s) => s.assignment_id))];
  const { data: assignments } = await supabase.from("assignments").select("id, title, lesson_id").in("id", assignmentIds);
  const lessonIds = [...new Set((assignments ?? []).map((a) => a.lesson_id))];
  const { data: lessons } = await supabase.from("lessons").select("id, session_number").in("id", lessonIds);
  const { data: profiles } = await supabase.from("profiles").select("id, full_name").in("id", studentIds);

  const assignmentById = new Map((assignments ?? []).map((a) => [a.id, a]));
  const lessonById = new Map((lessons ?? []).map((l) => [l.id, l]));
  const profileById = new Map((profiles ?? []).map((p) => [p.id, p]));

  return submissions.map((s) => {
    const assignment = assignmentById.get(s.assignment_id);
    const lesson = assignment ? lessonById.get(assignment.lesson_id) : undefined;
    return {
      submissionId: s.id,
      studentId: s.student_profile_id,
      studentName: profileById.get(s.student_profile_id)?.full_name ?? "",
      assignmentTitle: assignment?.title ?? "",
      lessonSessionNumber: lesson?.session_number ?? 0,
      status: s.status,
      submittedAt: s.submitted_at,
      attemptNumber: s.attempt_number,
    };
  });
}

export interface TeacherDashboardData {
  classCount: number;
  studentCount: number;
  pendingReviewCount: number;
  recentActivity: GradingQueueItem[];
}

export async function getTeacherDashboard(teacherProfileId: string): Promise<TeacherDashboardData> {
  const classes = await getTeacherClasses(teacherProfileId);
  const queue = await getGradingQueue(teacherProfileId);
  const studentCount = classes.reduce((sum, c) => sum + c.studentCount, 0);

  return {
    classCount: classes.length,
    studentCount,
    pendingReviewCount: queue.length,
    recentActivity: queue.slice(0, 5),
  };
}

export async function verifyTeacherOwnsClass(teacherProfileId: string, classId: string): Promise<boolean> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("class_teachers")
    .select("id")
    .eq("teacher_profile_id", teacherProfileId)
    .eq("class_id", classId)
    .maybeSingle();
  return Boolean(data);
}

export async function verifyTeacherOwnsStudent(teacherProfileId: string, studentProfileId: string): Promise<boolean> {
  const supabase = await createClient();
  const { data: links } = await supabase
    .from("class_teachers")
    .select("class_id")
    .eq("teacher_profile_id", teacherProfileId);
  const classIds = (links ?? []).map((l) => l.class_id);
  if (classIds.length === 0) return false;

  const { data } = await supabase
    .from("class_enrollments")
    .select("id")
    .eq("student_profile_id", studentProfileId)
    .in("class_id", classIds)
    .limit(1)
    .maybeSingle();
  return Boolean(data);
}

export interface ClassDetail {
  classRow: import("@/types/database").ClassRow;
  courseTitle: string;
  students: {
    profileId: string;
    fullName: string;
    completedLessons: number;
    totalLessons: number;
    latestScore: number | null;
  }[];
}

export async function getClassDetail(classId: string): Promise<ClassDetail | null> {
  const supabase = await createClient();
  const { data: classRow } = await supabase.from("classes").select("*").eq("id", classId).maybeSingle();
  if (!classRow) return null;

  const { data: course } = await supabase.from("courses").select("title").eq("id", classRow.course_id).single();

  const { data: enrollments } = await supabase
    .from("class_enrollments")
    .select("student_profile_id")
    .eq("class_id", classId)
    .eq("status", "active");
  const studentIds = (enrollments ?? []).map((e) => e.student_profile_id);

  const { data: profiles } = studentIds.length
    ? await supabase.from("profiles").select("id, full_name").in("id", studentIds)
    : { data: [] };

  const { data: allProgress } = studentIds.length
    ? await supabase.from("student_lesson_progress").select("student_profile_id, status").in("student_profile_id", studentIds)
    : { data: [] };

  const { data: allLessons } = await supabase.from("lessons").select("id").eq("is_published", true);
  const totalLessons = allLessons?.length ?? 22;

  const { data: submissions } = studentIds.length
    ? await supabase
        .from("submissions")
        .select("student_profile_id, best_score, created_at")
        .in("student_profile_id", studentIds)
        .not("best_score", "is", null)
        .order("created_at", { ascending: false })
    : { data: [] };

  const completedByStudent = new Map<string, number>();
  for (const p of allProgress ?? []) {
    if (p.status === "completed") {
      completedByStudent.set(p.student_profile_id, (completedByStudent.get(p.student_profile_id) ?? 0) + 1);
    }
  }

  const latestScoreByStudent = new Map<string, number>();
  for (const s of submissions ?? []) {
    if (!latestScoreByStudent.has(s.student_profile_id) && s.best_score != null) {
      latestScoreByStudent.set(s.student_profile_id, s.best_score);
    }
  }

  return {
    classRow,
    courseTitle: course?.title ?? "",
    students: (profiles ?? []).map((p) => ({
      profileId: p.id,
      fullName: p.full_name,
      completedLessons: completedByStudent.get(p.id) ?? 0,
      totalLessons,
      latestScore: latestScoreByStudent.get(p.id) ?? null,
    })),
  };
}

export interface SubmissionForGrading {
  submission: import("@/types/database").SubmissionRow;
  student: { id: string; fullName: string };
  assignment: import("@/types/database").AssignmentRow;
  lesson: import("@/types/database").LessonRow;
  rubricCriteria: import("@/types/database").AssignmentRubricCriterionRow[];
  files: import("@/types/database").SubmissionFileRow[];
  reviewHistory: import("@/types/database").SubmissionReviewRow[];
  previousBestScore: number | null;
}

export async function getSubmissionForGrading(submissionId: string): Promise<SubmissionForGrading | null> {
  const supabase = await createClient();

  const { data: submission } = await supabase.from("submissions").select("*").eq("id", submissionId).maybeSingle();
  if (!submission) return null;

  const { data: student } = await supabase
    .from("profiles")
    .select("id, full_name")
    .eq("id", submission.student_profile_id)
    .single();
  if (!student) return null;

  const { data: assignment } = await supabase
    .from("assignments")
    .select("*")
    .eq("id", submission.assignment_id)
    .single();
  if (!assignment) return null;

  const { data: lesson } = await supabase.from("lessons").select("*").eq("id", assignment.lesson_id).single();
  if (!lesson) return null;

  const { data: rubricCriteria } = await supabase
    .from("assignment_rubric_criteria")
    .select("*")
    .eq("assignment_id", assignment.id)
    .order("order_index", { ascending: true });

  const { data: files } = await supabase
    .from("submission_files")
    .select("*")
    .eq("submission_id", submissionId)
    .order("created_at", { ascending: true });

  const { data: reviewHistory } = await supabase
    .from("submission_reviews")
    .select("*")
    .eq("submission_id", submissionId)
    .order("reviewed_at", { ascending: false });

  const { data: previousSubmissions } = await supabase
    .from("submissions")
    .select("best_score")
    .eq("assignment_id", assignment.id)
    .eq("student_profile_id", submission.student_profile_id)
    .neq("id", submissionId)
    .not("best_score", "is", null)
    .order("best_score", { ascending: false })
    .limit(1);

  return {
    submission,
    student: { id: student.id, fullName: student.full_name },
    assignment,
    lesson,
    rubricCriteria: rubricCriteria ?? [],
    files: files ?? [],
    reviewHistory: reviewHistory ?? [],
    previousBestScore: previousSubmissions?.[0]?.best_score ?? null,
  };
}

export interface TeacherReportData {
  averageCompletionPercent: number;
  scoreDistribution: { bucket: string; count: number }[];
  studentsNeedingSupport: { fullName: string; completedLessons: number }[];
  studentsImproving: { fullName: string; latestScore: number }[];
}

export async function getTeacherReports(teacherProfileId: string): Promise<TeacherReportData> {
  const classes = await getTeacherClasses(teacherProfileId);
  const classDetails = await Promise.all(classes.map((c) => getClassDetail(c.id)));
  const students = classDetails.flatMap((d) => d?.students ?? []);

  const avgCompletion =
    students.length > 0
      ? Math.round(
          (students.reduce((sum, s) => sum + s.completedLessons / (s.totalLessons || 1), 0) / students.length) * 100,
        )
      : 0;

  const buckets = [
    { bucket: "0-49", min: 0, max: 49, count: 0 },
    { bucket: "50-69", min: 50, max: 69, count: 0 },
    { bucket: "70-84", min: 70, max: 84, count: 0 },
    { bucket: "85-100", min: 85, max: 100, count: 0 },
  ];
  for (const s of students) {
    if (s.latestScore == null) continue;
    const bucket = buckets.find((b) => s.latestScore! >= b.min && s.latestScore! <= b.max);
    if (bucket) bucket.count++;
  }

  const studentsNeedingSupport = [...students]
    .sort((a, b) => a.completedLessons - b.completedLessons)
    .slice(0, 5)
    .map((s) => ({ fullName: s.fullName, completedLessons: s.completedLessons }));

  const studentsImproving = [...students]
    .filter((s) => s.latestScore != null)
    .sort((a, b) => (b.latestScore ?? 0) - (a.latestScore ?? 0))
    .slice(0, 5)
    .map((s) => ({ fullName: s.fullName, latestScore: s.latestScore ?? 0 }));

  return {
    averageCompletionPercent: avgCompletion,
    scoreDistribution: buckets.map((b) => ({ bucket: b.bucket, count: b.count })),
    studentsNeedingSupport,
    studentsImproving,
  };
}
