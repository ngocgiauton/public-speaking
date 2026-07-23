export interface PracticeItem {
  slug: string;
  name: string;
  skill:
    | "Eye Contact"
    | "Posture"
    | "Gesture"
    | "Facial Expression"
    | "Pronunciation"
    | "Volume"
    | "Pace"
    | "Pause"
    | "Emphasis"
    | "Storytelling"
    | "Opening"
    | "Closing"
    | "Impromptu Speech";
  level: "Cơ bản" | "Trung bình" | "Nâng cao";
  durationSeconds: number;
  instructions: string;
  xpEligible: boolean;
}

export const PRACTICE_ITEMS: PracticeItem[] = [
  {
    slug: "eye-contact",
    name: "Luyện ánh mắt",
    skill: "Eye Contact",
    level: "Cơ bản",
    durationSeconds: 60,
    instructions: "Đứng trước gương, luân phiên nhìn 3 điểm khác nhau trong 60 giây trong khi nói.",
    xpEligible: true,
  },
  {
    slug: "posture",
    name: "Luyện tư thế",
    skill: "Posture",
    level: "Cơ bản",
    durationSeconds: 60,
    instructions: "Đứng thẳng, hai chân rộng bằng vai, giữ tư thế trong 60 giây khi nói một đoạn ngắn.",
    xpEligible: true,
  },
  {
    slug: "gesture",
    name: "Luyện cử chỉ",
    skill: "Gesture",
    level: "Trung bình",
    durationSeconds: 90,
    instructions: "Kể một câu chuyện ngắn, dùng cử chỉ tay để minh họa 3 ý chính.",
    xpEligible: true,
  },
  {
    slug: "facial-expression",
    name: "Luyện biểu cảm",
    skill: "Facial Expression",
    level: "Cơ bản",
    durationSeconds: 60,
    instructions: "Thể hiện 3 cảm xúc khác nhau (vui, ngạc nhiên, nghiêm túc) qua khuôn mặt khi nói.",
    xpEligible: true,
  },
  {
    slug: "pronunciation",
    name: "Luyện phát âm",
    skill: "Pronunciation",
    level: "Cơ bản",
    durationSeconds: 60,
    instructions: "Đọc to và rõ một đoạn văn ngắn, chú ý phát âm tròn vành rõ chữ.",
    xpEligible: true,
  },
  {
    slug: "volume",
    name: "Luyện âm lượng",
    skill: "Volume",
    level: "Cơ bản",
    durationSeconds: 60,
    instructions: "Nói cùng một câu với 3 mức âm lượng: nhỏ, vừa, lớn.",
    xpEligible: true,
  },
  {
    slug: "pace",
    name: "Luyện tốc độ nói",
    skill: "Pace",
    level: "Trung bình",
    durationSeconds: 90,
    instructions: "Nói một đoạn văn với tốc độ chậm, sau đó nói lại với tốc độ nhanh hơn một chút.",
    xpEligible: true,
  },
  {
    slug: "pause",
    name: "Luyện khoảng ngừng",
    skill: "Pause",
    level: "Trung bình",
    durationSeconds: 90,
    instructions: "Nói một đoạn văn, cố ý dừng 2 giây sau mỗi ý quan trọng.",
    xpEligible: true,
  },
  {
    slug: "emphasis",
    name: "Luyện nhấn giọng",
    skill: "Emphasis",
    level: "Trung bình",
    durationSeconds: 60,
    instructions: "Đọc một câu và nhấn mạnh vào từ khóa khác nhau mỗi lần đọc.",
    xpEligible: true,
  },
  {
    slug: "storytelling",
    name: "Luyện kể chuyện",
    skill: "Storytelling",
    level: "Nâng cao",
    durationSeconds: 120,
    instructions: "Kể một câu chuyện ngắn có mở đầu, cao trào và kết thúc trong 2 phút.",
    xpEligible: true,
  },
  {
    slug: "opening",
    name: "Luyện mở bài",
    skill: "Opening",
    level: "Trung bình",
    durationSeconds: 60,
    instructions: "Luyện tập câu mở đầu gây chú ý cho một chủ đề tự chọn.",
    xpEligible: true,
  },
  {
    slug: "closing",
    name: "Luyện kết bài",
    skill: "Closing",
    level: "Trung bình",
    durationSeconds: 60,
    instructions: "Luyện tập câu kết đáng nhớ, tóm tắt thông điệp chính.",
    xpEligible: true,
  },
  {
    slug: "impromptu-speech",
    name: "Nói ứng khẩu",
    skill: "Impromptu Speech",
    level: "Nâng cao",
    durationSeconds: 60,
    instructions: "Chọn một chủ đề bất kỳ và nói liên tục trong 60 giây không chuẩn bị trước.",
    xpEligible: true,
  },
];

export function getPracticeItem(slug: string): PracticeItem | undefined {
  return PRACTICE_ITEMS.find((item) => item.slug === slug);
}
