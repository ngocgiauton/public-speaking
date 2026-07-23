/**
 * Kiểu dữ liệu TypeScript tương ứng với schema Supabase (supabase/migrations).
 * Được viết tay để khớp chính xác với các migration — khi schema thay đổi,
 * cập nhật file này (hoặc chạy `supabase gen types` nếu có Supabase CLI kết
 * nối tới project thật và thay thế file này).
 */

export type Json = string | number | boolean | null | { [key: string]: Json } | Json[];

export type UserRole = "student" | "parent" | "teacher" | "admin";
export type ProfileStatus = "active" | "locked";
export type SubmissionStatusDb =
  | "draft"
  | "submitted"
  | "under_review"
  | "revision_requested"
  | "resubmitted"
  | "approved"
  | "rejected";
export type LessonProgressStatus =
  | "locked"
  | "available"
  | "in_progress"
  | "completed"
  | "needs_revision";
export type QuestionType = "single_choice" | "multiple_choice" | "true_false" | "ordering";
export type NotificationType = "info" | "success" | "warning" | "grading" | "badge" | "system";
export type LeadStatus = "new" | "contacted" | "consulting" | "registered" | "not_suitable";

interface Table<Row, Insert, Update = Partial<Insert>> {
  Row: Row;
  Insert: Insert;
  Update: Update;
  Relationships: [];
}

export type ProfileRow = {
  id: string;
  role: UserRole;
  full_name: string;
  avatar_url: string | null;
  phone: string | null;
  status: ProfileStatus;
  created_at: string;
  updated_at: string;
};

export type StudentProfileRow = {
  profile_id: string;
  date_of_birth: string | null;
  school: string | null;
  english_level: string | null;
  current_academic_level_id: string | null;
  total_xp: number;
  current_streak_days: number;
  longest_streak_days: number;
  last_active_date: string | null;
  baseline_note: string | null;
  created_at: string;
  updated_at: string;
};

export type ParentProfileRow = {
  profile_id: string;
  occupation: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export type TeacherProfileRow = {
  profile_id: string;
  bio: string | null;
  specialties: string | null;
  created_at: string;
  updated_at: string;
};

export type ParentStudentLinkRow = {
  id: string;
  parent_profile_id: string;
  student_profile_id: string;
  relationship: string;
  status: "active" | "pending" | "revoked";
  created_at: string;
};

export type CourseRow = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  is_published: boolean;
  created_at: string;
  updated_at: string;
};

export type CourseLevelRow = {
  id: string;
  course_id: string;
  order_index: number;
  slug: string;
  name: string;
  description: string | null;
  created_at: string;
  updated_at: string;
};

export type LessonRow = {
  id: string;
  course_level_id: string;
  slug: string;
  session_number: number;
  title: string;
  short_description: string | null;
  duration_minutes: number;
  objectives: Json;
  key_takeaways: Json;
  video_url: string | null;
  video_watch_threshold_percent: number;
  xp_reward: number;
  unlock_rules: Json;
  is_published: boolean;
  created_at: string;
  updated_at: string;
};

export type LessonSectionRow = {
  id: string;
  lesson_id: string;
  title: string;
  body: string;
  example_correct: string | null;
  example_incorrect: string | null;
  memory_tip: string | null;
  common_mistake: string | null;
  order_index: number;
  created_at: string;
  updated_at: string;
};

export type LessonResourceRow = {
  id: string;
  lesson_id: string;
  title: string;
  url: string;
  resource_type: "link" | "pdf" | "video" | "audio" | "image";
  order_index: number;
  created_at: string;
};

export type LessonPrerequisiteRow = {
  id: string;
  lesson_id: string;
  prerequisite_lesson_id: string;
};

export type ClassRow = {
  id: string;
  course_id: string;
  name: string;
  status: "active" | "completed" | "archived";
  start_date: string | null;
  created_at: string;
  updated_at: string;
};

export type ClassTeacherRow = {
  id: string;
  class_id: string;
  teacher_profile_id: string;
  role: "main" | "assistant";
  created_at: string;
};

export type ClassEnrollmentRow = {
  id: string;
  class_id: string;
  student_profile_id: string;
  status: "active" | "completed" | "withdrawn";
  enrolled_at: string;
};

export type StudentLessonProgressRow = {
  id: string;
  student_profile_id: string;
  lesson_id: string;
  status: LessonProgressStatus;
  video_completed: boolean;
  knowledge_completed: boolean;
  quiz_passed: boolean;
  assignment_status: SubmissionStatusDb | "not_submitted";
  completed_at: string | null;
  created_at: string;
  updated_at: string;
};

export type VideoWatchProgressRow = {
  id: string;
  student_profile_id: string;
  lesson_id: string;
  watched_seconds: number;
  total_seconds: number;
  watch_percent: number;
  completed: boolean;
  updated_at: string;
};

export type LearningSessionRow = {
  id: string;
  student_profile_id: string;
  activity_type: "lesson_view" | "quiz" | "assignment" | "practice";
  lesson_id: string | null;
  started_at: string;
  ended_at: string | null;
  created_at: string;
};

export type StreakRow = {
  id: string;
  student_profile_id: string;
  activity_date: string;
  created_at: string;
};

export type QuizRow = {
  id: string;
  lesson_id: string;
  title: string;
  instructions: string | null;
  pass_score: number;
  max_attempts: number | null;
  is_published: boolean;
  created_at: string;
  updated_at: string;
};

export type QuizQuestionRow = {
  id: string;
  quiz_id: string;
  question_text: string;
  question_type: QuestionType;
  explanation: string | null;
  points: number;
  order_index: number;
  created_at: string;
  updated_at: string;
};

export type QuizOptionRow = {
  id: string;
  question_id: string;
  option_text: string;
  is_correct: boolean;
  order_index: number;
  created_at: string;
};

export type QuizAttemptRow = {
  id: string;
  quiz_id: string;
  student_profile_id: string;
  attempt_number: number;
  score: number;
  is_passed: boolean;
  started_at: string;
  submitted_at: string | null;
  created_at: string;
};

export type QuizAnswerRow = {
  id: string;
  attempt_id: string;
  question_id: string;
  selected_option_ids: Json;
  is_correct: boolean;
  points_earned: number;
  created_at: string;
};

export type AssignmentRow = {
  id: string;
  lesson_id: string;
  title: string;
  description: string | null;
  instructions: string | null;
  assignment_type: "main" | "practice";
  allowed_media: Json;
  max_video_mb: number;
  max_audio_mb: number;
  due_offset_days: number | null;
  min_pass_score: number;
  xp_reward: number;
  is_published: boolean;
  created_at: string;
  updated_at: string;
};

export type AssignmentRubricCriterionRow = {
  id: string;
  assignment_id: string;
  criterion_key: string;
  group_key: string;
  label: string;
  max_score: number;
  order_index: number;
};

export type SubmissionRow = {
  id: string;
  assignment_id: string;
  student_profile_id: string;
  class_id: string | null;
  title: string | null;
  notes: string | null;
  status: SubmissionStatusDb;
  attempt_number: number;
  due_at: string | null;
  submitted_at: string | null;
  best_score: number | null;
  created_at: string;
  updated_at: string;
};

export type SubmissionFileRow = {
  id: string;
  submission_id: string;
  file_type: "video" | "audio";
  storage_path: string;
  original_filename: string | null;
  mime_type: string | null;
  size_bytes: number | null;
  created_at: string;
};

export type SubmissionReviewRow = {
  id: string;
  submission_id: string;
  teacher_profile_id: string;
  overall_comment: string | null;
  strengths: string | null;
  improvements: string | null;
  decision: "approved" | "revision_requested" | "rejected";
  total_score: number;
  reviewed_at: string;
  created_at: string;
};

export type SubmissionScoreRow = {
  id: string;
  submission_review_id: string;
  criterion_key: string;
  group_key: string;
  score: number;
  max_score: number;
  created_at: string;
};

export type SubmissionCommentRow = {
  id: string;
  submission_id: string;
  author_profile_id: string;
  comment_text: string;
  created_at: string;
};

export type XpTransactionRow = {
  id: string;
  student_profile_id: string;
  amount: number;
  reason_code: string;
  reference_type: "lesson" | "quiz" | "assignment" | "submission" | "streak" | "manual" | null;
  reference_id: string | null;
  note: string | null;
  created_by: string | null;
  created_at: string;
};

export type StudentRankRow = {
  student_profile_id: string;
  rank_slug: string;
  achieved_at: string;
  updated_at: string;
};

export type BadgeRow = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  icon: string;
  criteria_type:
    | "lesson_complete"
    | "quiz_score"
    | "assignment_approved"
    | "streak"
    | "total_xp"
    | "skill_score"
    | "manual";
  criteria_value: Json;
  rarity: "common" | "rare" | "epic" | "legendary";
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type StudentBadgeRow = {
  id: string;
  student_profile_id: string;
  badge_id: string;
  awarded_at: string;
  awarded_by: string | null;
};

export type CertificateRow = {
  id: string;
  course_id: string;
  name: string;
  description: string | null;
  template_url: string | null;
  criteria: Json;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type StudentCertificateRow = {
  id: string;
  student_profile_id: string;
  certificate_id: string;
  certificate_number: string;
  file_path: string | null;
  issued_at: string;
};

export type AnnouncementRow = {
  id: string;
  class_id: string | null;
  author_profile_id: string;
  title: string;
  body: string;
  created_at: string;
};

export type NotificationRow = {
  id: string;
  recipient_profile_id: string;
  title: string;
  body: string | null;
  type: NotificationType;
  link: string | null;
  reference_type: string | null;
  reference_id: string | null;
  is_read: boolean;
  created_at: string;
};

export type ConsultationLeadRow = {
  id: string;
  student_full_name: string;
  student_date_of_birth: string | null;
  school: string | null;
  english_level: string | null;
  parent_full_name: string;
  phone: string;
  email: string | null;
  learning_goal: string | null;
  preferred_format: string | null;
  preferred_schedule: string | null;
  note: string | null;
  status: LeadStatus;
  created_at: string;
  updated_at: string;
};

export type SiteSettingRow = {
  key: string;
  value: Json;
  updated_at: string;
};

export type FaqItemRow = {
  id: string;
  question: string;
  answer: string;
  order_index: number;
  is_published: boolean;
  created_at: string;
  updated_at: string;
};

export type TestimonialRow = {
  id: string;
  author_name: string;
  author_role: string | null;
  content: string;
  is_placeholder: boolean;
  is_published: boolean;
  order_index: number;
  created_at: string;
  updated_at: string;
};

/** Chỉ các cột trong `Required` là bắt buộc — dùng cho bảng có nhiều cột DEFAULT. */
type WithDefaults<T, Req extends keyof T> = Pick<T, Req> & Partial<Omit<T, Req>>;

export type Database = {
  public: {
    Tables: {
      profiles: Table<ProfileRow, WithDefaults<ProfileRow, "id" | "role" | "full_name">>;
      student_profiles: Table<StudentProfileRow, WithDefaults<StudentProfileRow, "profile_id">>;
      parent_profiles: Table<ParentProfileRow, WithDefaults<ParentProfileRow, "profile_id">>;
      teacher_profiles: Table<TeacherProfileRow, WithDefaults<TeacherProfileRow, "profile_id">>;
      parent_student_links: Table<ParentStudentLinkRow, WithDefaults<ParentStudentLinkRow, "parent_profile_id" | "student_profile_id">>;
      courses: Table<CourseRow, WithDefaults<CourseRow, "slug" | "title">>;
      course_levels: Table<CourseLevelRow, WithDefaults<CourseLevelRow, "course_id" | "order_index" | "slug" | "name">>;
      lessons: Table<LessonRow, WithDefaults<LessonRow, "course_level_id" | "slug" | "session_number" | "title">>;
      lesson_sections: Table<LessonSectionRow, WithDefaults<LessonSectionRow, "lesson_id" | "title" | "body">>;
      lesson_resources: Table<LessonResourceRow, WithDefaults<LessonResourceRow, "lesson_id" | "title" | "url">>;
      lesson_prerequisites: Table<LessonPrerequisiteRow, WithDefaults<LessonPrerequisiteRow, "lesson_id" | "prerequisite_lesson_id">>;
      classes: Table<ClassRow, WithDefaults<ClassRow, "course_id" | "name">>;
      class_teachers: Table<ClassTeacherRow, WithDefaults<ClassTeacherRow, "class_id" | "teacher_profile_id">>;
      class_enrollments: Table<ClassEnrollmentRow, WithDefaults<ClassEnrollmentRow, "class_id" | "student_profile_id">>;
      student_lesson_progress: Table<StudentLessonProgressRow, WithDefaults<StudentLessonProgressRow, "student_profile_id" | "lesson_id">>;
      video_watch_progress: Table<VideoWatchProgressRow, WithDefaults<VideoWatchProgressRow, "student_profile_id" | "lesson_id">>;
      learning_sessions: Table<LearningSessionRow, WithDefaults<LearningSessionRow, "student_profile_id" | "activity_type">>;
      streaks: Table<StreakRow, WithDefaults<StreakRow, "student_profile_id" | "activity_date">>;
      quizzes: Table<QuizRow, WithDefaults<QuizRow, "lesson_id" | "title">>;
      quiz_questions: Table<QuizQuestionRow, WithDefaults<QuizQuestionRow, "quiz_id" | "question_text" | "question_type">>;
      quiz_options: Table<QuizOptionRow, WithDefaults<QuizOptionRow, "question_id" | "option_text">>;
      quiz_attempts: Table<QuizAttemptRow, WithDefaults<QuizAttemptRow, "quiz_id" | "student_profile_id">>;
      quiz_answers: Table<QuizAnswerRow, WithDefaults<QuizAnswerRow, "attempt_id" | "question_id">>;
      assignments: Table<AssignmentRow, WithDefaults<AssignmentRow, "lesson_id" | "title">>;
      assignment_rubric_criteria: Table<AssignmentRubricCriterionRow, WithDefaults<AssignmentRubricCriterionRow, "assignment_id" | "criterion_key" | "group_key" | "label" | "max_score">>;
      submissions: Table<SubmissionRow, WithDefaults<SubmissionRow, "assignment_id" | "student_profile_id">>;
      submission_files: Table<SubmissionFileRow, WithDefaults<SubmissionFileRow, "submission_id" | "file_type" | "storage_path">>;
      submission_reviews: Table<SubmissionReviewRow, WithDefaults<SubmissionReviewRow, "submission_id" | "teacher_profile_id" | "decision">>;
      submission_scores: Table<SubmissionScoreRow, WithDefaults<SubmissionScoreRow, "submission_review_id" | "criterion_key" | "group_key" | "score" | "max_score">>;
      submission_comments: Table<SubmissionCommentRow, WithDefaults<SubmissionCommentRow, "submission_id" | "author_profile_id" | "comment_text">>;
      xp_transactions: Table<XpTransactionRow, WithDefaults<XpTransactionRow, "student_profile_id" | "amount" | "reason_code">>;
      student_ranks: Table<StudentRankRow, WithDefaults<StudentRankRow, "student_profile_id">>;
      badges: Table<BadgeRow, WithDefaults<BadgeRow, "slug" | "name" | "criteria_type">>;
      student_badges: Table<StudentBadgeRow, WithDefaults<StudentBadgeRow, "student_profile_id" | "badge_id">>;
      certificates: Table<CertificateRow, WithDefaults<CertificateRow, "course_id" | "name">>;
      student_certificates: Table<StudentCertificateRow, WithDefaults<StudentCertificateRow, "student_profile_id" | "certificate_id" | "certificate_number">>;
      announcements: Table<AnnouncementRow, WithDefaults<AnnouncementRow, "author_profile_id" | "title" | "body">>;
      notifications: Table<NotificationRow, WithDefaults<NotificationRow, "recipient_profile_id" | "title">>;
      consultation_leads: Table<ConsultationLeadRow, WithDefaults<ConsultationLeadRow, "student_full_name" | "parent_full_name" | "phone">>;
      site_settings: Table<SiteSettingRow, WithDefaults<SiteSettingRow, "key">>;
      faq_items: Table<FaqItemRow, WithDefaults<FaqItemRow, "question" | "answer">>;
      testimonials: Table<TestimonialRow, WithDefaults<TestimonialRow, "author_name" | "content">>;
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
};
