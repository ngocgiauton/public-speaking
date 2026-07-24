/**
 * Cấu hình game hóa: XP, rank thành tích. Level học thuật (0-5) được lưu
 * trong bảng `course_levels` — không nhầm với rank thành tích ở đây.
 */

export const XP_RULES = {
  lessonVideoComplete: 10,
  knowledgeComplete: 10,
  quizComplete: 20,
  practiceSubmit: 30,
  assignmentComplete: 50,
  scoreBonusThreshold: 85,
  scoreBonus: 20,
  onTimeBonus: 10,
  improvementMinDelta: 10,
  improvementBonus: 20,
  streak3Days: 10,
  streak7Days: 30,
} as const;

export type XpReasonCode =
  | "lesson_video_complete"
  | "knowledge_complete"
  | "quiz_complete"
  | "practice_submit"
  | "assignment_complete"
  | "score_bonus"
  | "on_time_bonus"
  | "improvement_bonus"
  | "streak_3_days"
  | "streak_7_days"
  | "teacher_bonus"
  | "manual_adjustment";

export const XP_REASON_LABELS_VI: Record<XpReasonCode, string> = {
  lesson_video_complete: "Xem hoàn thành bài giảng",
  knowledge_complete: "Hoàn thành nội dung kiến thức",
  quiz_complete: "Hoàn thành quiz",
  practice_submit: "Nộp bài luyện tập",
  assignment_complete: "Hoàn thành bài tập chính",
  score_bonus: "Thưởng đạt từ 85 điểm",
  on_time_bonus: "Thưởng nộp bài đúng hạn",
  improvement_bonus: "Thưởng cải thiện điểm số",
  streak_3_days: "Thưởng chuỗi học 3 ngày",
  streak_7_days: "Thưởng chuỗi học 7 ngày",
  teacher_bonus: "XP thưởng từ giáo viên",
  manual_adjustment: "Điều chỉnh thủ công",
};

export type RankSlug =
  | "beginner-speaker"
  | "bronze-speaker"
  | "silver-speaker"
  | "gold-speaker"
  | "platinum-speaker"
  | "royal-speaker"
  | "master-speaker";

export interface RankDefinition {
  slug: RankSlug;
  name: string;
  minXp: number;
}

/** Ngưỡng XP để đạt từng rank thành tích, xếp tăng dần. */
export const RANKS: RankDefinition[] = [
  { slug: "beginner-speaker", name: "Beginner Speaker", minXp: 0 },
  { slug: "bronze-speaker", name: "Bronze Speaker", minXp: 150 },
  { slug: "silver-speaker", name: "Silver Speaker", minXp: 400 },
  { slug: "gold-speaker", name: "Gold Speaker", minXp: 800 },
  { slug: "platinum-speaker", name: "Platinum Speaker", minXp: 1400 },
  { slug: "royal-speaker", name: "Royal Speaker", minXp: 2200 },
  { slug: "master-speaker", name: "Master Speaker", minXp: 3200 },
];

export const ACADEMIC_LEVELS = [
  { order: 0, name: "Khởi động" },
  { order: 1, name: "Body Language" },
  { order: 2, name: "Tone of Voice" },
  { order: 3, name: "Content" },
  { order: 4, name: "Stage Skills" },
  { order: 5, name: "Final Speaker" },
] as const;

export const RUBRIC_GROUPS = [
  {
    key: "body_language",
    label: "Body Language",
    maxScore: 20,
    criteria: [
      { key: "eye_contact", label: "Ánh mắt", maxScore: 5 },
      { key: "posture", label: "Tư thế", maxScore: 5 },
      { key: "gesture", label: "Cử chỉ", maxScore: 5 },
      { key: "movement", label: "Di chuyển", maxScore: 5 },
    ],
  },
  {
    key: "tone_of_voice",
    label: "Tone of Voice",
    maxScore: 20,
    criteria: [
      { key: "volume", label: "Âm lượng", maxScore: 4 },
      { key: "pronunciation", label: "Phát âm", maxScore: 4 },
      { key: "pace", label: "Tốc độ", maxScore: 4 },
      { key: "pause", label: "Khoảng ngừng", maxScore: 4 },
      { key: "emotion", label: "Cảm xúc", maxScore: 4 },
    ],
  },
  {
    key: "content",
    label: "Content",
    maxScore: 25,
    criteria: [
      { key: "core_idea", label: "Ý tưởng trung tâm", maxScore: 5 },
      { key: "structure", label: "Cấu trúc", maxScore: 5 },
      { key: "evidence", label: "Dẫn chứng", maxScore: 5 },
      { key: "storytelling", label: "Kể chuyện", maxScore: 5 },
      { key: "opening_closing", label: "Mở và kết bài", maxScore: 5 },
    ],
  },
  {
    key: "stage_skills",
    label: "Stage Skills",
    maxScore: 20,
    criteria: [
      { key: "preparation", label: "Chuẩn bị", maxScore: 5 },
      { key: "stage_command", label: "Làm chủ sân khấu", maxScore: 5 },
      { key: "interaction", label: "Tương tác", maxScore: 5 },
      { key: "handling_situations", label: "Xử lý tình huống", maxScore: 5 },
    ],
  },
  {
    key: "confidence_connection",
    label: "Confidence and Connection",
    maxScore: 15,
    criteria: [
      { key: "confidence", label: "Sự tự tin", maxScore: 5 },
      { key: "authenticity", label: "Sự chân thật", maxScore: 5 },
      { key: "connection", label: "Khả năng kết nối", maxScore: 5 },
    ],
  },
] as const;

export const RUBRIC_MAX_TOTAL = RUBRIC_GROUPS.reduce(
  (sum, group) => sum + group.maxScore,
  0,
);

export const CRITERION_LABELS: Record<string, string> = Object.fromEntries(
  RUBRIC_GROUPS.flatMap((group) => group.criteria.map((c) => [c.key, c.label])),
);

export interface UnlockRules {
  minVideoWatchPercent: number;
  requireQuizPass: boolean;
  requireAssignmentSubmitted: boolean;
  minAssignmentScore: number;
  requirePreviousApproved: boolean;
}

export const DEFAULT_UNLOCK_RULES: UnlockRules = {
  minVideoWatchPercent: 80,
  requireQuizPass: true,
  requireAssignmentSubmitted: true,
  minAssignmentScore: 70,
  requirePreviousApproved: true,
};

export const TEACHER_BONUS_XP_LIMIT = 30;
