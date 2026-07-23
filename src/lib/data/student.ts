import "server-only";
import { createClient } from "@/lib/supabase/server";
import { checkLessonUnlock, type LockReason } from "@/features/progress/unlock";
import { getRankForXp } from "@/features/xp/xp";
import type {
  AssignmentRow,
  LessonRow,
  LessonSectionRow,
  QuizOptionRow,
  QuizQuestionRow,
  QuizRow,
  StudentLessonProgressRow,
  SubmissionRow,
  VideoWatchProgressRow,
} from "@/types/database";
import type { SkillScores } from "@/components/dashboard/skill-score-card";
import { RUBRIC_GROUPS } from "@/config/gamification";

export interface JourneyLesson {
  lesson: LessonRow;
  progress: StudentLessonProgressRow | null;
  quiz: QuizRow | null;
  assignment: AssignmentRow | null;
  displayStatus: "completed" | "in_progress" | "available" | "locked" | "needs_revision";
  lockReasons: LockReason[];
}

export interface JourneyLevel {
  id: string;
  name: string;
  orderIndex: number;
  lessons: JourneyLesson[];
}

async function getStudentCourseData(studentProfileId: string) {
  const supabase = await createClient();

  const { data: course } = await supabase
    .from("courses")
    .select("*")
    .eq("is_published", true)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (!course) return null;

  const { data: levels } = await supabase
    .from("course_levels")
    .select("*")
    .eq("course_id", course.id)
    .order("order_index", { ascending: true });

  const { data: lessons } = await supabase
    .from("lessons")
    .select("*")
    .in("course_level_id", (levels ?? []).map((l) => l.id))
    .eq("is_published", true)
    .order("session_number", { ascending: true });

  const lessonIds = (lessons ?? []).map((l) => l.id);

  const { data: quizzes } = await supabase.from("quizzes").select("*").in("lesson_id", lessonIds);
  const { data: assignments } = await supabase.from("assignments").select("*").in("lesson_id", lessonIds);
  const { data: progress } = await supabase
    .from("student_lesson_progress")
    .select("*")
    .eq("student_profile_id", studentProfileId)
    .in("lesson_id", lessonIds);

  const assignmentIds = (assignments ?? []).map((a) => a.id);
  const { data: submissions } = await supabase
    .from("submissions")
    .select("*")
    .eq("student_profile_id", studentProfileId)
    .in("assignment_id", assignmentIds);

  return {
    course,
    levels: levels ?? [],
    lessons: lessons ?? [],
    quizzes: quizzes ?? [],
    assignments: assignments ?? [],
    progress: progress ?? [],
    submissions: submissions ?? [],
  };
}

export async function getStudentJourney(studentProfileId: string): Promise<JourneyLevel[] | null> {
  const data = await getStudentCourseData(studentProfileId);
  if (!data) return null;

  const progressByLesson = new Map(data.progress.map((p) => [p.lesson_id, p]));
  const quizByLesson = new Map(data.quizzes.map((q) => [q.lesson_id, q]));
  const assignmentByLesson = new Map(data.assignments.map((a) => [a.lesson_id, a]));
  const bestScoreByAssignment = new Map<string, number | null>();
  for (const submission of data.submissions) {
    const current = bestScoreByAssignment.get(submission.assignment_id);
    if (submission.best_score != null && (current == null || submission.best_score > current)) {
      bestScoreByAssignment.set(submission.assignment_id, submission.best_score);
    }
  }

  const sortedLessons = [...data.lessons].sort((a, b) => a.session_number - b.session_number);

  function completionOf(lesson: LessonRow) {
    const progress = progressByLesson.get(lesson.id) ?? null;
    const quiz = quizByLesson.get(lesson.id);
    const assignment = assignmentByLesson.get(lesson.id);
    const bestScore = assignment ? (bestScoreByAssignment.get(assignment.id) ?? null) : null;

    const result = checkLessonUnlock({
      previousLessonApproved: true,
      quizPassed: quiz ? (progress?.quiz_passed ?? false) : true,
      assignmentStatus: assignment ? (progress?.assignment_status ?? "not_submitted") : "approved",
      bestScore,
      rules: {
        requireQuizPass: Boolean(quiz),
        requireAssignmentSubmitted: Boolean(assignment),
        minAssignmentScore: assignment ? assignment.min_pass_score : 0,
        requirePreviousApproved: false,
      },
    });

    // Video phải đạt ngưỡng xem mới coi là hoàn thành bài — điều kiện này
    // không nằm trong checkLessonUnlock() (dùng riêng cho lý do khóa bài kế
    // tiếp), nên kiểm tra bổ sung tại đây.
    const videoDone = Boolean(progress?.video_completed);
    return { unlocked: result.unlocked && videoDone, reasons: result.reasons };
  }

  const journeyLessons: JourneyLesson[] = [];

  for (let i = 0; i < sortedLessons.length; i++) {
    const lesson = sortedLessons[i];
    const progress = progressByLesson.get(lesson.id) ?? null;
    const quiz = quizByLesson.get(lesson.id) ?? null;
    const assignment = assignmentByLesson.get(lesson.id) ?? null;

    let displayStatus: JourneyLesson["displayStatus"];
    let lockReasons: LockReason[] = [];

    if (i === 0) {
      const completion = completionOf(lesson);
      displayStatus = progress?.status === "completed" ? "completed" : progress ? "in_progress" : "available";
      if (progress?.assignment_status === "revision_requested") displayStatus = "needs_revision";
      lockReasons = completion.unlocked ? [] : completion.reasons;
    } else {
      const previousLesson = sortedLessons[i - 1];
      const previousCompletion = completionOf(previousLesson);
      const previousProgress = progressByLesson.get(previousLesson.id);

      if (!previousProgress) {
        displayStatus = "locked";
        lockReasons = ["previous_lesson_incomplete"];
      } else if (!previousCompletion.unlocked) {
        displayStatus = "locked";
        lockReasons = previousCompletion.reasons;
      } else if (progress?.assignment_status === "revision_requested") {
        displayStatus = "needs_revision";
      } else if (progress?.status === "completed") {
        displayStatus = "completed";
      } else if (progress) {
        displayStatus = "in_progress";
      } else {
        displayStatus = "available";
      }
    }

    journeyLessons.push({ lesson, progress, quiz, assignment, displayStatus, lockReasons });
  }

  return data.levels.map((level) => ({
    id: level.id,
    name: level.name,
    orderIndex: level.order_index,
    lessons: journeyLessons.filter((jl) => jl.lesson.course_level_id === level.id),
  }));
}

export interface StudentDashboardData {
  totalXp: number;
  rankName: string;
  currentStreak: number;
  completionPercent: number;
  nextLesson: JourneyLesson | null;
  pendingReview: number;
  needsRevision: number;
  recentBadges: { name: string; icon: string; rarity: string }[];
  skillScores: SkillScores;
}

export async function getStudentDashboard(studentProfileId: string): Promise<StudentDashboardData> {
  const supabase = await createClient();

  const { data: profile } = await supabase
    .from("student_profiles")
    .select("*")
    .eq("profile_id", studentProfileId)
    .single();

  const journey = (await getStudentJourney(studentProfileId)) ?? [];
  const allLessons = journey.flatMap((l) => l.lessons);
  const totalLessons = allLessons.length || 1;
  const completedLessons = allLessons.filter((l) => l.displayStatus === "completed").length;
  const nextLesson =
    allLessons.find((l) => l.displayStatus === "available" || l.displayStatus === "in_progress") ?? null;
  const pendingReview = allLessons.filter(
    (l) => l.progress?.assignment_status === "submitted" || l.progress?.assignment_status === "under_review",
  ).length;
  const needsRevision = allLessons.filter((l) => l.displayStatus === "needs_revision").length;

  const { data: badgeLinks } = await supabase
    .from("student_badges")
    .select("badge_id, awarded_at")
    .eq("student_profile_id", studentProfileId)
    .order("awarded_at", { ascending: false })
    .limit(4);

  const badgeIds = (badgeLinks ?? []).map((b) => b.badge_id);
  const { data: badgeDefs } = badgeIds.length
    ? await supabase.from("badges").select("id, name, icon, rarity").in("id", badgeIds)
    : { data: [] };

  const badgeDefById = new Map((badgeDefs ?? []).map((b) => [b.id, b]));
  const recentBadges = (badgeLinks ?? [])
    .map((link) => badgeDefById.get(link.badge_id))
    .filter((b): b is NonNullable<typeof b> => b != null)
    .map((b) => ({ name: b.name, icon: b.icon, rarity: b.rarity }));

  const skillScores = await getStudentSkillScores(studentProfileId);

  return {
    totalXp: profile?.total_xp ?? 0,
    rankName: getRankForXp(profile?.total_xp ?? 0).name,
    currentStreak: profile?.current_streak_days ?? 0,
    completionPercent: Math.round((completedLessons / totalLessons) * 100),
    nextLesson,
    pendingReview,
    needsRevision,
    recentBadges,
    skillScores,
  };
}

export async function getStudentSkillScores(studentProfileId: string): Promise<SkillScores> {
  const supabase = await createClient();

  const { data: submissions } = await supabase
    .from("submissions")
    .select("id")
    .eq("student_profile_id", studentProfileId)
    .eq("status", "approved");

  const emptyScores: SkillScores = {
    body_language: null,
    tone_of_voice: null,
    content: null,
    stage_skills: null,
    confidence_connection: null,
  };

  const submissionIds = (submissions ?? []).map((s) => s.id);
  if (submissionIds.length === 0) return emptyScores;

  const { data: reviews } = await supabase
    .from("submission_reviews")
    .select("id")
    .in("submission_id", submissionIds)
    .eq("decision", "approved");

  const reviewIds = (reviews ?? []).map((r) => r.id);
  if (reviewIds.length === 0) return emptyScores;

  const { data: scores } = await supabase
    .from("submission_scores")
    .select("group_key, score, max_score")
    .in("submission_review_id", reviewIds);

  const totals = new Map<string, { score: number; max: number }>();
  for (const row of scores ?? []) {
    const current = totals.get(row.group_key) ?? { score: 0, max: 0 };
    current.score += row.score;
    current.max += row.max_score;
    totals.set(row.group_key, current);
  }

  const result: Record<string, number | null> = { ...emptyScores };

  for (const group of RUBRIC_GROUPS) {
    const total = totals.get(group.key);
    if (!total || total.max === 0) continue;
    const percent = total.score / total.max;
    result[group.key] = Math.round(percent * group.maxScore);
  }

  return result as unknown as SkillScores;
}

export interface StudentSubmissionListItem extends SubmissionRow {
  assignment_title: string;
  lesson_title: string;
  lesson_session_number: number;
}

export async function getStudentSubmissions(
  studentProfileId: string,
): Promise<StudentSubmissionListItem[]> {
  const supabase = await createClient();
  const { data: submissions } = await supabase
    .from("submissions")
    .select("*")
    .eq("student_profile_id", studentProfileId)
    .order("created_at", { ascending: false });

  if (!submissions || submissions.length === 0) return [];

  const assignmentIds = [...new Set(submissions.map((s) => s.assignment_id))];
  const { data: assignments } = await supabase
    .from("assignments")
    .select("id, title, lesson_id")
    .in("id", assignmentIds);

  const lessonIds = [...new Set((assignments ?? []).map((a) => a.lesson_id))];
  const { data: lessons } = await supabase
    .from("lessons")
    .select("id, title, session_number")
    .in("id", lessonIds);

  const lessonById = new Map((lessons ?? []).map((l) => [l.id, l]));
  const assignmentById = new Map((assignments ?? []).map((a) => [a.id, a]));

  return submissions.map((submission) => {
    const assignment = assignmentById.get(submission.assignment_id);
    const lesson = assignment ? lessonById.get(assignment.lesson_id) : undefined;
    return {
      ...submission,
      assignment_title: assignment?.title ?? "",
      lesson_title: lesson?.title ?? "",
      lesson_session_number: lesson?.session_number ?? 0,
    };
  });
}

export interface LessonDetail {
  lesson: LessonRow;
  sections: LessonSectionRow[];
  quiz: QuizRow | null;
  questions: QuizQuestionRow[];
  optionsByQuestion: Record<string, QuizOptionRow[]>;
  assignment: AssignmentRow | null;
  progress: StudentLessonProgressRow | null;
  videoWatch: VideoWatchProgressRow | null;
  isUnlocked: boolean;
  lockReasons: LockReason[];
}

export async function getLessonDetail(
  studentProfileId: string,
  lessonId: string,
): Promise<LessonDetail | null> {
  const supabase = await createClient();

  const { data: lesson } = await supabase.from("lessons").select("*").eq("id", lessonId).maybeSingle();
  if (!lesson) return null;

  const journey = await getStudentJourney(studentProfileId);
  const journeyItem = journey?.flatMap((l) => l.lessons).find((jl) => jl.lesson.id === lessonId);

  const [{ data: sections }, { data: quiz }, { data: assignment }, { data: progress }, { data: videoWatch }] =
    await Promise.all([
      supabase.from("lesson_sections").select("*").eq("lesson_id", lessonId).order("order_index", { ascending: true }),
      supabase.from("quizzes").select("*").eq("lesson_id", lessonId).eq("is_published", true).maybeSingle(),
      supabase.from("assignments").select("*").eq("lesson_id", lessonId).eq("is_published", true).maybeSingle(),
      supabase
        .from("student_lesson_progress")
        .select("*")
        .eq("student_profile_id", studentProfileId)
        .eq("lesson_id", lessonId)
        .maybeSingle(),
      supabase
        .from("video_watch_progress")
        .select("*")
        .eq("student_profile_id", studentProfileId)
        .eq("lesson_id", lessonId)
        .maybeSingle(),
    ]);

  let questions: QuizQuestionRow[] = [];
  let optionsByQuestion: Record<string, QuizOptionRow[]> = {};

  if (quiz) {
    const { data: questionRows } = await supabase
      .from("quiz_questions")
      .select("*")
      .eq("quiz_id", quiz.id)
      .order("order_index", { ascending: true });
    questions = questionRows ?? [];

    const { data: optionRows } = await supabase
      .from("quiz_options")
      .select("*")
      .in("question_id", questions.map((q) => q.id));

    optionsByQuestion = {};
    for (const opt of optionRows ?? []) {
      const list = optionsByQuestion[opt.question_id] ?? [];
      list.push(opt);
      optionsByQuestion[opt.question_id] = list;
    }
  }

  return {
    lesson,
    sections: sections ?? [],
    quiz: quiz ?? null,
    questions,
    optionsByQuestion,
    assignment: assignment ?? null,
    progress: progress ?? null,
    videoWatch: videoWatch ?? null,
    isUnlocked: journeyItem ? journeyItem.displayStatus !== "locked" : lesson.session_number === 1,
    lockReasons: journeyItem?.lockReasons ?? [],
  };
}

export interface AssignmentWorkspace {
  assignment: AssignmentRow;
  lesson: LessonRow;
  submission: SubmissionRow | null;
  files: import("@/types/database").SubmissionFileRow[];
  latestReview: import("@/types/database").SubmissionReviewRow | null;
}

export async function getAssignmentWorkspace(
  studentProfileId: string,
  assignmentId: string,
): Promise<AssignmentWorkspace | null> {
  const supabase = await createClient();

  const { data: assignment } = await supabase.from("assignments").select("*").eq("id", assignmentId).maybeSingle();
  if (!assignment) return null;

  const { data: lesson } = await supabase.from("lessons").select("*").eq("id", assignment.lesson_id).single();
  if (!lesson) return null;

  const { data: submission } = await supabase
    .from("submissions")
    .select("*")
    .eq("assignment_id", assignmentId)
    .eq("student_profile_id", studentProfileId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  let files: import("@/types/database").SubmissionFileRow[] = [];
  let latestReview: import("@/types/database").SubmissionReviewRow | null = null;

  if (submission) {
    const { data: fileRows } = await supabase
      .from("submission_files")
      .select("*")
      .eq("submission_id", submission.id)
      .order("created_at", { ascending: true });
    files = fileRows ?? [];

    const { data: reviewRows } = await supabase
      .from("submission_reviews")
      .select("*")
      .eq("submission_id", submission.id)
      .order("reviewed_at", { ascending: false })
      .limit(1);
    latestReview = reviewRows?.[0] ?? null;
  }

  return { assignment, lesson, submission: submission ?? null, files, latestReview };
}

export async function getSubmissionById(studentProfileId: string, submissionId: string) {
  const supabase = await createClient();

  const { data: submission } = await supabase
    .from("submissions")
    .select("*")
    .eq("id", submissionId)
    .eq("student_profile_id", studentProfileId)
    .maybeSingle();

  if (!submission) return null;

  const { data: assignment } = await supabase
    .from("assignments")
    .select("*")
    .eq("id", submission.assignment_id)
    .single();
  if (!assignment) return null;

  const { data: lesson } = await supabase.from("lessons").select("*").eq("id", assignment.lesson_id).single();
  if (!lesson) return null;

  const { data: files } = await supabase
    .from("submission_files")
    .select("*")
    .eq("submission_id", submissionId)
    .order("created_at", { ascending: true });
  const { data: reviews } = await supabase
    .from("submission_reviews")
    .select("*")
    .eq("submission_id", submissionId)
    .order("reviewed_at", { ascending: false });

  const latestReview = reviews?.[0] ?? null;
  let scores: import("@/types/database").SubmissionScoreRow[] = [];
  if (latestReview) {
    const { data } = await supabase.from("submission_scores").select("*").eq("submission_review_id", latestReview.id);
    scores = data ?? [];
  }

  return { submission, assignment, lesson, files: files ?? [], latestReview, scores };
}

export async function getStudentBadgesOverview(studentProfileId: string) {
  const supabase = await createClient();
  const { data: allBadges } = await supabase.from("badges").select("*").eq("is_active", true);
  const { data: earned } = await supabase
    .from("student_badges")
    .select("badge_id, awarded_at")
    .eq("student_profile_id", studentProfileId);

  const earnedMap = new Map((earned ?? []).map((e) => [e.badge_id, e.awarded_at]));

  return (allBadges ?? []).map((badge) => ({
    badge,
    awarded: earnedMap.has(badge.id),
    awardedAt: earnedMap.get(badge.id) ?? null,
  }));
}

export async function getStudentRank(studentProfileId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("student_ranks")
    .select("rank_slug")
    .eq("student_profile_id", studentProfileId)
    .maybeSingle();
  return data?.rank_slug ?? "beginner-speaker";
}

export async function getStudentCertificates(studentProfileId: string) {
  const supabase = await createClient();
  const { data: earned } = await supabase
    .from("student_certificates")
    .select("*")
    .eq("student_profile_id", studentProfileId)
    .order("issued_at", { ascending: false });

  if (!earned || earned.length === 0) return [];

  const certificateIds = earned.map((e) => e.certificate_id);
  const { data: certificates } = await supabase.from("certificates").select("*").in("id", certificateIds);
  const certById = new Map((certificates ?? []).map((c) => [c.id, c]));

  return earned.map((e) => ({ studentCertificate: e, certificate: certById.get(e.certificate_id) }));
}

export async function getStudentNotifications(studentProfileId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("notifications")
    .select("*")
    .eq("recipient_profile_id", studentProfileId)
    .order("created_at", { ascending: false })
    .limit(50);
  return data ?? [];
}
