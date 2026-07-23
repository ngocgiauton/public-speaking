export const siteConfig = {
  name: "Public Speaking – Diễn Giả Nhí",
  organization: "Royal Public Speaking Club",
  director: "Đỗ Phúc Nhật Minh",
  directorTitle: "Chủ nhiệm Royal Public Speaking Club",
  slogan: "Speak to Lead",
  description:
    "Nền tảng giúp trẻ từng bước xây dựng sự tự tin, phát triển tư duy, làm chủ kỹ năng thuyết trình và học cách dẫn dắt bằng tiếng nói của mình.",
  url: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
} as const;

export const publicNav = [
  { href: "/", label: "Trang chủ" },
  { href: "/gioi-thieu", label: "Giới thiệu" },
  { href: "/chuong-trinh", label: "Chương trình" },
  { href: "/lo-trinh", label: "Lộ trình" },
  { href: "/giang-vien", label: "Giảng viên" },
  { href: "/cau-hoi-thuong-gap", label: "FAQ" },
] as const;

export const pillars = [
  {
    slug: "body-language",
    title: "Body Language",
    subtitle: "Ngôn ngữ cơ thể",
    description:
      "Ánh mắt, tư thế, cử chỉ và sự di chuyển có chủ đích trên sân khấu.",
  },
  {
    slug: "tone-of-voice",
    title: "Tone of Voice",
    subtitle: "Giọng nói",
    description: "Âm lượng, tốc độ, khoảng ngừng và cảm xúc trong giọng nói.",
  },
  {
    slug: "content",
    title: "Content",
    subtitle: "Nội dung",
    description: "Ý tưởng trung tâm, cấu trúc bài nói và kể chuyện thuyết phục.",
  },
  {
    slug: "stage-skills",
    title: "Stage Skills",
    subtitle: "Kỹ năng sân khấu",
    description: "Chuẩn bị, kiểm soát hồi hộp và kết nối với khán giả.",
  },
] as const;

export const problemStatements = [
  "Trẻ ngại nói trước đám đông",
  "Trẻ có ý tưởng nhưng trình bày chưa rõ",
  "Giọng nói nhỏ hoặc đều đều",
  "Thiếu ánh mắt và sự kết nối",
  "Nội dung lan man",
  "Khó kiểm soát hồi hộp",
  "Chưa biết kể chuyện và dẫn dắt người nghe",
] as const;

export const platformExperienceSteps = [
  "Học bài",
  "Luyện tập",
  "Nộp video",
  "Nhận phản hồi",
  "Kiếm XP",
  "Lên level",
  "Nhận huy hiệu",
  "Theo dõi tiến bộ",
] as const;

export const faqItems = [
  {
    question: "Chương trình phù hợp với độ tuổi nào?",
    answer:
      "Thông tin độ tuổi khuyến nghị cụ thể sẽ được Royal Public Speaking Club cập nhật tại đây. Vui lòng đăng ký tư vấn để được hỗ trợ chi tiết theo từng học viên.",
  },
  {
    question: "Học viên chưa tự tin có thể tham gia không?",
    answer:
      "Chương trình được thiết kế theo lộ trình từ cơ bản, phù hợp với học viên chưa có kinh nghiệm nói trước đám đông. Đội ngũ sẽ tư vấn cụ thể sau khi tìm hiểu về học viên.",
  },
  {
    question: "Học viên cần trình độ tiếng Anh như thế nào?",
    answer:
      "Chương trình giảng dạy bằng tiếng Việt là chính, có sử dụng song ngữ cho một số thuật ngữ chuyên môn. Yêu cầu tiếng Anh cụ thể (nếu có) sẽ được cập nhật tại đây.",
  },
  {
    question: "Mỗi buổi học kéo dài bao lâu?",
    answer:
      "Thời lượng từng buổi học sẽ được Royal Public Speaking Club công bố và cập nhật tại đây.",
  },
  {
    question: "Phụ huynh theo dõi tiến độ bằng cách nào?",
    answer:
      "Phụ huynh có khu vực riêng trên nền tảng để xem tiến độ học, điểm kỹ năng, bài đã nộp và phản hồi của giáo viên theo thời gian thực sau khi được liên kết với học viên.",
  },
  {
    question: "Bài tập video được chấm như thế nào?",
    answer:
      "Giáo viên chấm bài theo rubric 5 nhóm kỹ năng (Body Language, Tone of Voice, Content, Stage Skills, Confidence and Connection) và gửi phản hồi chi tiết cho từng bài nộp.",
  },
  {
    question: "Khi nào học viên được lên level?",
    answer:
      "Học viên lên level học thuật khi hoàn thành các điều kiện của bài học (xem video, hoàn thành quiz, bài tập được duyệt). Rank thành tích tăng theo tổng XP tích lũy.",
  },
  {
    question: "Chương trình có chứng nhận không?",
    answer:
      "Nền tảng có hệ thống chứng nhận cho học viên hoàn thành khóa học. Hình thức và điều kiện cấp chứng nhận cụ thể sẽ được cập nhật tại đây.",
  },
] as const;
