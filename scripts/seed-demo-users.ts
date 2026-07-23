/**
 * Tạo tài khoản demo an toàn cho môi trường development/staging.
 *
 * Dùng Supabase Admin API (service role key) để tạo user trong auth.users —
 * KHÔNG insert trực tiếp vào auth.users bằng SQL vì schema nội bộ của GoTrue
 * có thể thay đổi giữa các phiên bản. Mật khẩu được sinh ngẫu nhiên khi chạy
 * và chỉ in ra terminal / ghi vào file cục bộ đã bị .gitignore — không bao
 * giờ được commit vào repository.
 *
 * Chạy: pnpm seed:demo
 * Yêu cầu biến môi trường: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
 */
import { randomBytes } from "node:crypto";
import { writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { config as loadEnv } from "dotenv";
import { createClient } from "@supabase/supabase-js";

loadEnv({ path: resolve(process.cwd(), ".env.local") });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error(
    "Thiếu NEXT_PUBLIC_SUPABASE_URL hoặc SUPABASE_SERVICE_ROLE_KEY trong .env.local. " +
      "Xem README.md phần 'Cấu hình environment variables'.",
  );
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const LESSON_IDS = Array.from({ length: 22 }, (_, i) =>
  `10000000-0000-0000-0000-0000000001${String(i + 1).padStart(2, "0")}`,
);
const LEVEL_IDS = {
  0: "10000000-0000-0000-0000-000000000010",
  1: "10000000-0000-0000-0000-000000000011",
  2: "10000000-0000-0000-0000-000000000012",
  3: "10000000-0000-0000-0000-000000000013",
  4: "10000000-0000-0000-0000-000000000014",
  5: "10000000-0000-0000-0000-000000000015",
} as const;
const LESSON2_QUIZ_ID = "10000000-0000-0000-0000-000000000201";
const LESSON2_QUESTIONS = [
  "10000000-0000-0000-0000-000000000211",
  "10000000-0000-0000-0000-000000000212",
  "10000000-0000-0000-0000-000000000213",
  "10000000-0000-0000-0000-000000000214",
];
const LESSON2_ASSIGNMENT_ID = "10000000-0000-0000-0000-000000000301";
const CLASS_A = "10000000-0000-0000-0000-000000000501";
const CLASS_B = "10000000-0000-0000-0000-000000000502";
const BADGE = {
  firstSpeech: "10000000-0000-0000-0000-000000000401",
  eyeContact: "10000000-0000-0000-0000-000000000402",
  confidentSpeaker: "10000000-0000-0000-0000-000000000410",
};

function randomPassword(): string {
  return randomBytes(9).toString("base64url");
}

interface DemoAccount {
  email: string;
  fullName: string;
  role: "admin" | "teacher" | "parent" | "student";
  password: string;
}

const accounts: DemoAccount[] = [
  { email: "admin@demo.royalspeaking.vn", fullName: "Quản trị viên Demo", role: "admin", password: randomPassword() },
  { email: "teacher1@demo.royalspeaking.vn", fullName: "Cô Lan", role: "teacher", password: randomPassword() },
  { email: "teacher2@demo.royalspeaking.vn", fullName: "Thầy Nam", role: "teacher", password: randomPassword() },
  { email: "parent1@demo.royalspeaking.vn", fullName: "Phụ huynh Bình An", role: "parent", password: randomPassword() },
  { email: "parent2@demo.royalspeaking.vn", fullName: "Phụ huynh Thu Hà", role: "parent", password: randomPassword() },
  { email: "parent3@demo.royalspeaking.vn", fullName: "Phụ huynh Quốc Việt", role: "parent", password: randomPassword() },
  { email: "student1@demo.royalspeaking.vn", fullName: "Bảo An", role: "student", password: randomPassword() },
  { email: "student2@demo.royalspeaking.vn", fullName: "Gia Hân", role: "student", password: randomPassword() },
  { email: "student3@demo.royalspeaking.vn", fullName: "Minh Khôi", role: "student", password: randomPassword() },
  { email: "student4@demo.royalspeaking.vn", fullName: "Thảo Vy", role: "student", password: randomPassword() },
  { email: "student5@demo.royalspeaking.vn", fullName: "Đức Anh", role: "student", password: randomPassword() },
];

async function findExistingUserId(email: string): Promise<string | null> {
  const { data, error } = await supabase.auth.admin.listUsers({ page: 1, perPage: 200 });
  if (error) throw error;
  return data.users.find((u) => u.email === email)?.id ?? null;
}

async function ensureUser(account: DemoAccount): Promise<string> {
  const { data, error } = await supabase.auth.admin.createUser({
    email: account.email,
    password: account.password,
    email_confirm: true,
    user_metadata: { full_name: account.fullName, role: account.role },
  });

  if (!error && data.user) return data.user.id;

  const existingId = await findExistingUserId(account.email);
  if (existingId) {
    await supabase.auth.admin.updateUserById(existingId, { password: account.password });
    return existingId;
  }

  throw error ?? new Error(`Không thể tạo user ${account.email}`);
}

async function xp(studentId: string, amount: number, reasonCode: string, referenceType?: string, referenceId?: string) {
  const { error } = await supabase.from("xp_transactions").insert({
    student_profile_id: studentId,
    amount,
    reason_code: reasonCode,
    reference_type: referenceType ?? null,
    reference_id: referenceId ?? null,
    note: "Seed demo data",
  });
  if (error) throw error;
}

async function main() {
  console.log("Đang tạo tài khoản demo...");
  const ids: Record<string, string> = {};
  for (const account of accounts) {
    ids[account.email] = await ensureUser(account);
    console.log(`  - ${account.role.padEnd(8)} ${account.email}`);
  }

  const teacherIds = { t1: ids["teacher1@demo.royalspeaking.vn"], t2: ids["teacher2@demo.royalspeaking.vn"] };
  const parentIds = {
    p1: ids["parent1@demo.royalspeaking.vn"],
    p2: ids["parent2@demo.royalspeaking.vn"],
    p3: ids["parent3@demo.royalspeaking.vn"],
  };
  const studentIds = [1, 2, 3, 4, 5].map((n) => ids[`student${n}@demo.royalspeaking.vn`]);

  console.log("Gán vai trò và hồ sơ...");
  await supabase.from("teacher_profiles").upsert(
    [teacherIds.t1, teacherIds.t2].map((id) => ({ profile_id: id })),
  );
  await supabase.from("parent_profiles").upsert(
    [parentIds.p1, parentIds.p2, parentIds.p3].map((id) => ({ profile_id: id })),
  );
  await supabase.from("student_profiles").upsert(
    studentIds.map((id) => ({ profile_id: id, current_academic_level_id: LEVEL_IDS[1] })),
  );

  console.log("Gán lớp học và liên kết phụ huynh...");
  await supabase.from("class_teachers").upsert(
    [
      { class_id: CLASS_A, teacher_profile_id: teacherIds.t1, role: "main" },
      { class_id: CLASS_B, teacher_profile_id: teacherIds.t2, role: "main" },
    ],
    { onConflict: "class_id,teacher_profile_id" },
  );
  await supabase.from("class_enrollments").upsert(
    [
      { class_id: CLASS_A, student_profile_id: studentIds[0] },
      { class_id: CLASS_A, student_profile_id: studentIds[1] },
      { class_id: CLASS_A, student_profile_id: studentIds[2] },
      { class_id: CLASS_B, student_profile_id: studentIds[3] },
      { class_id: CLASS_B, student_profile_id: studentIds[4] },
    ],
    { onConflict: "class_id,student_profile_id" },
  );
  await supabase.from("parent_student_links").upsert(
    [
      { parent_profile_id: parentIds.p1, student_profile_id: studentIds[0] },
      { parent_profile_id: parentIds.p1, student_profile_id: studentIds[1] },
      { parent_profile_id: parentIds.p2, student_profile_id: studentIds[2] },
      { parent_profile_id: parentIds.p3, student_profile_id: studentIds[3] },
      { parent_profile_id: parentIds.p3, student_profile_id: studentIds[4] },
    ],
    { onConflict: "parent_profile_id,student_profile_id" },
  );

  // Tiến độ: số bài mỗi học viên đã hoàn thành + 1 bài đang học (in_progress).
  const completedCounts = [5, 3, 1, 8, 2];

  console.log("Tạo tiến độ học tập và XP...");
  for (let i = 0; i < studentIds.length; i++) {
    const studentId = studentIds[i];
    const completed = completedCounts[i];

    for (let s = 1; s <= completed; s++) {
      const lessonId = LESSON_IDS[s - 1];
      await supabase.from("student_lesson_progress").upsert(
        {
          student_profile_id: studentId,
          lesson_id: lessonId,
          status: "completed",
          video_completed: true,
          knowledge_completed: true,
          quiz_passed: true,
          assignment_status: s === 2 ? "approved" : "not_submitted",
          completed_at: new Date().toISOString(),
        },
        { onConflict: "student_profile_id,lesson_id" },
      );
      await supabase.from("video_watch_progress").upsert(
        {
          student_profile_id: studentId,
          lesson_id: lessonId,
          watched_seconds: 2700,
          total_seconds: 2700,
          watch_percent: 100,
          completed: true,
        },
        { onConflict: "student_profile_id,lesson_id" },
      );
      await xp(studentId, 10, "lesson_video_complete", "lesson", lessonId);
      await xp(studentId, 10, "knowledge_complete", "lesson", lessonId);
    }

    if (completed < 22) {
      const nextLessonId = LESSON_IDS[completed];
      await supabase.from("student_lesson_progress").upsert(
        {
          student_profile_id: studentId,
          lesson_id: nextLessonId,
          status: "in_progress",
          video_completed: false,
        },
        { onConflict: "student_profile_id,lesson_id" },
      );
      await supabase.from("video_watch_progress").upsert(
        {
          student_profile_id: studentId,
          lesson_id: nextLessonId,
          watched_seconds: 1200,
          total_seconds: 2700,
          watch_percent: 44,
          completed: false,
        },
        { onConflict: "student_profile_id,lesson_id" },
      );
    }
  }

  console.log("Tạo quiz attempt + bài nộp mẫu cho buổi 2...");
  // Học viên 1, 2, 4 đã học tới buổi 2 → có quiz attempt.
  for (const idx of [0, 1, 3]) {
    const studentId = studentIds[idx];
    const { data: attempt } = await supabase
      .from("quiz_attempts")
      .insert({
        quiz_id: LESSON2_QUIZ_ID,
        student_profile_id: studentId,
        attempt_number: 1,
        score: 100,
        is_passed: true,
        submitted_at: new Date().toISOString(),
      })
      .select("id")
      .single();
    if (attempt) {
      await supabase.from("quiz_answers").insert(
        LESSON2_QUESTIONS.map((questionId) => ({
          attempt_id: attempt.id,
          question_id: questionId,
          is_correct: true,
          points_earned: 25,
        })),
      );
    }
    await xp(studentId, 20, "quiz_complete", "quiz", LESSON2_QUIZ_ID);
  }

  // Học viên 1: bài nộp đã được duyệt điểm cao.
  const { data: sub1 } = await supabase
    .from("submissions")
    .insert({
      assignment_id: LESSON2_ASSIGNMENT_ID,
      student_profile_id: studentIds[0],
      class_id: CLASS_A,
      title: "Tự giới thiệu bản thân",
      status: "approved",
      attempt_number: 1,
      submitted_at: new Date(Date.now() - 3 * 86400000).toISOString(),
      best_score: 90,
    })
    .select("id")
    .single();

  if (sub1) {
    await supabase.from("submission_files").insert({
      submission_id: sub1.id,
      file_type: "video",
      storage_path: `submission-media/${studentIds[0]}/${sub1.id}/tu-gioi-thieu.mp4`,
      original_filename: "tu-gioi-thieu.mp4",
      mime_type: "video/mp4",
      size_bytes: 15_000_000,
    });
    const { data: review1 } = await supabase
      .from("submission_reviews")
      .insert({
        submission_id: sub1.id,
        teacher_profile_id: teacherIds.t1,
        overall_comment: "Em thể hiện rất tự tin và ánh mắt kết nối tốt với camera.",
        strengths: "Ánh mắt tự nhiên, tư thế vững vàng.",
        improvements: "Có thể mỉm cười nhiều hơn ở phần mở đầu.",
        decision: "approved",
        total_score: 18,
      })
      .select("id")
      .single();
    if (review1) {
      await supabase.from("submission_scores").insert([
        { submission_review_id: review1.id, criterion_key: "eye_contact", group_key: "body_language", score: 5, max_score: 5 },
        { submission_review_id: review1.id, criterion_key: "posture", group_key: "body_language", score: 4, max_score: 5 },
        { submission_review_id: review1.id, criterion_key: "confidence", group_key: "confidence_connection", score: 4, max_score: 5 },
        { submission_review_id: review1.id, criterion_key: "connection", group_key: "confidence_connection", score: 5, max_score: 5 },
      ]);
    }
    await xp(studentIds[0], 50, "assignment_complete", "submission", sub1.id);
    await xp(studentIds[0], 20, "score_bonus", "submission", sub1.id);
    await xp(studentIds[0], 10, "on_time_bonus", "submission", sub1.id);
    await supabase.from("student_badges").upsert(
      [
        { student_profile_id: studentIds[0], badge_id: BADGE.firstSpeech },
        { student_profile_id: studentIds[0], badge_id: BADGE.eyeContact },
        { student_profile_id: studentIds[0], badge_id: BADGE.confidentSpeaker },
      ],
      { onConflict: "student_profile_id,badge_id" },
    );
  }

  // Học viên 2: đang chờ giáo viên chấm.
  await supabase.from("submissions").insert({
    assignment_id: LESSON2_ASSIGNMENT_ID,
    student_profile_id: studentIds[1],
    class_id: CLASS_A,
    title: "Tự giới thiệu bản thân",
    status: "under_review",
    attempt_number: 1,
    submitted_at: new Date(Date.now() - 86400000).toISOString(),
  });

  // Học viên 4: giáo viên yêu cầu làm lại.
  const { data: sub4 } = await supabase
    .from("submissions")
    .insert({
      assignment_id: LESSON2_ASSIGNMENT_ID,
      student_profile_id: studentIds[3],
      class_id: CLASS_B,
      title: "Tự giới thiệu bản thân",
      status: "revision_requested",
      attempt_number: 1,
      submitted_at: new Date(Date.now() - 2 * 86400000).toISOString(),
    })
    .select("id")
    .single();
  if (sub4) {
    await supabase.from("submission_reviews").insert({
      submission_id: sub4.id,
      teacher_profile_id: teacherIds.t2,
      overall_comment: "Em quay lại video ở nơi thiếu ánh sáng, khó thấy biểu cảm.",
      strengths: "Giọng nói rõ ràng, tự tin.",
      improvements: "Quay lại ở nơi đủ sáng, giữ ánh mắt nhìn thẳng vào camera.",
      decision: "revision_requested",
      total_score: 10,
    });
  }

  // Học viên 3: mới lưu bản nháp.
  await supabase.from("submissions").insert({
    assignment_id: LESSON2_ASSIGNMENT_ID,
    student_profile_id: studentIds[2],
    class_id: CLASS_A,
    title: "Tự giới thiệu bản thân (nháp)",
    notes: "Con đang quay thử, chưa ưng ý phần mở đầu.",
    status: "draft",
    attempt_number: 1,
  });

  console.log("Tạo chuỗi ngày học (streak) cho học viên 1...");
  const today = new Date();
  for (let d = 0; d < 3; d++) {
    const date = new Date(today);
    date.setDate(date.getDate() - d);
    await supabase.from("streaks").upsert(
      { student_profile_id: studentIds[0], activity_date: date.toISOString().slice(0, 10) },
      { onConflict: "student_profile_id,activity_date" },
    );
  }
  await supabase
    .from("student_profiles")
    .update({ current_streak_days: 3, longest_streak_days: 3 })
    .eq("profile_id", studentIds[0]);

  console.log("Tạo thông báo mẫu...");
  await supabase.from("notifications").insert([
    {
      recipient_profile_id: studentIds[0],
      title: "Bài tập đã được duyệt",
      body: "Bài 'Tự giới thiệu bản thân' của em đã được cô Lan duyệt với điểm 90/100.",
      type: "success",
      link: "/student/bai-nop",
    },
    {
      recipient_profile_id: studentIds[3],
      title: "Cần làm lại bài tập",
      body: "Thầy Nam yêu cầu em làm lại bài 'Tự giới thiệu bản thân'.",
      type: "warning",
      link: "/student/bai-nop",
    },
    {
      recipient_profile_id: teacherIds.t1,
      title: "Có bài chờ chấm",
      body: "Gia Hân vừa nộp bài 'Tự giới thiệu bản thân'.",
      type: "info",
      link: "/teacher/bai-cho-cham",
    },
    {
      recipient_profile_id: parentIds.p1,
      title: "Tiến độ mới của con",
      body: "Bảo An vừa được duyệt bài tập buổi 2 với điểm 90/100.",
      type: "success",
      link: "/parent",
    },
  ]);

  console.log("Cập nhật rank thành tích dựa trên tổng XP...");
  const { data: rankedStudents } = await supabase
    .from("student_profiles")
    .select("profile_id, total_xp")
    .in("profile_id", studentIds);

  const RANKS = [
    { slug: "beginner-speaker", minXp: 0 },
    { slug: "bronze-speaker", minXp: 150 },
    { slug: "silver-speaker", minXp: 400 },
    { slug: "gold-speaker", minXp: 800 },
    { slug: "platinum-speaker", minXp: 1400 },
    { slug: "royal-speaker", minXp: 2200 },
    { slug: "master-speaker", minXp: 3200 },
  ];
  for (const row of rankedStudents ?? []) {
    let rank = RANKS[0];
    for (const r of RANKS) if ((row.total_xp ?? 0) >= r.minXp) rank = r;
    await supabase
      .from("student_ranks")
      .upsert({ student_profile_id: row.profile_id, rank_slug: rank.slug }, { onConflict: "student_profile_id" });
  }

  const credentialsPath = resolve(process.cwd(), "scripts/.demo-credentials.json");
  writeFileSync(
    credentialsPath,
    JSON.stringify(
      accounts.map(({ email, role, password }) => ({ email, role, password })),
      null,
      2,
    ),
  );

  console.log("\nHoàn tất. Mật khẩu demo đã được ghi vào scripts/.demo-credentials.json (không commit file này).");
  console.log("Danh sách tài khoản:");
  for (const account of accounts) {
    console.log(`  ${account.role.padEnd(8)} ${account.email}  mật khẩu: ${account.password}`);
  }
}

main().catch((error) => {
  console.error("Seed demo thất bại:", error);
  process.exit(1);
});
