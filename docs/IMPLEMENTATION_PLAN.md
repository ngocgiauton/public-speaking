# Kế hoạch triển khai — Public Speaking – Diễn Giả Nhí

> Tài liệu nội bộ cho đội ngũ kỹ thuật. Mô tả kiến trúc, các giai đoạn triển khai,
> thiết kế database, danh sách route, rủi ro và tiêu chí nghiệm thu của MVP.

## 1. Kiến trúc tổng quan

- **Next.js 16 (App Router, TypeScript strict)** lưu trữ cả frontend và các route
  xử lý phía server (Route Handlers + Server Actions).
- **Supabase** cung cấp PostgreSQL, Authentication (email/password), Row Level
  Security và Storage (avatars, lesson-media, submission-media, certificate-files).
- **Vercel** triển khai ứng dụng Next.js; **Supabase Cloud** lưu trữ database/storage.
- Truy cập dữ liệu qua hai client Supabase:
  - `lib/supabase/server.ts` — server-side, dùng cookie của người dùng, tôn trọng RLS.
  - `lib/supabase/admin.ts` — chỉ dùng trong route handler/server action tin cậy,
    dùng service role key, **không bao giờ** import vào client component.
- Phân quyền: RLS là lớp bảo vệ dữ liệu chính; route (proxy.ts) + kiểm tra vai trò
  trong server component là lớp phòng vệ thứ hai (defense in depth). Vai trò không
  bao giờ được tin cậy từ client.
- Gamification (XP, rank, huy hiệu, điều kiện mở khóa) được cài đặt dưới dạng hàm
  thuần (`lib/gamification/*`) để có thể unit test độc lập với database, sau đó
  được gọi từ server actions khi ghi dữ liệu.

## 2. Các giai đoạn triển khai

1. Khảo sát repository (trống — dự án mới).
2. Kế hoạch (tài liệu này).
3. Khởi tạo nền tảng: Next.js, Tailwind design tokens, font, layout, component
   cơ bản, Supabase client, proxy bảo vệ route.
4. Database: migration SQL, RLS, seed, kiểu dữ liệu TypeScript, data access layer.
5. Trang công khai: trang chủ, giới thiệu, chương trình, lộ trình, giảng viên,
   FAQ, đăng ký tư vấn, đăng nhập/quên mật khẩu.
6. Student MVP: dashboard, lộ trình, bài học, quiz, bài tập, nộp bài, XP/rank/badge.
7. Teacher MVP: dashboard, lớp học, hàng chờ chấm bài, chấm theo rubric, phản hồi.
8. Parent MVP: dashboard, chọn học viên, tiến độ, điểm, phản hồi.
9. Admin MVP: dashboard tổng hợp + CRUD người dùng/khóa học/bài học/quiz/bài
   tập/huy hiệu/lớp học/lead tư vấn.
10. Kiểm thử: lint, typecheck, unit test (Vitest), e2e (Playwright), build.
11. Tài liệu & triển khai: README, .env.example, SECURITY.md, GitHub Actions,
    hướng dẫn Vercel/Supabase.

## 3. Database (tóm tắt — chi tiết trong `supabase/migrations`)

Nhóm bảng chính: `profiles`, `student_profiles`, `parent_profiles`,
`teacher_profiles`, `parent_student_links`; `courses`, `course_levels`, `lessons`,
`lesson_sections`, `lesson_resources`, `lesson_prerequisites`; `classes`,
`class_teachers`, `class_enrollments`; `student_lesson_progress`,
`video_watch_progress`, `learning_sessions`, `streaks`; `quizzes`,
`quiz_questions`, `quiz_options`, `quiz_attempts`, `quiz_answers`;
`assignments`, `assignment_rubric_criteria`, `submissions`, `submission_files`,
`submission_reviews`, `submission_scores`, `submission_comments`;
`xp_transactions`, `ranks`, `student_rank_state`, `badges`, `student_badges`;
`certificates`, `student_certificates`; `notifications`, `announcements`;
`consultation_leads`, `site_settings`, `faq_items`, `testimonials`.

Nguyên tắc: UUID primary key (`gen_random_uuid()`), `created_at`/`updated_at`
với trigger `set_updated_at`, khóa ngoại + index cho các cột truy vấn thường
xuyên, trạng thái dùng `text` + `check constraint` (đơn giản, dễ đọc trong SQL
thô hơn enum khi cần migrate).

RLS: bật cho toàn bộ bảng chứa dữ liệu người dùng; chính sách theo vai trò dựa
trên `auth.uid()` và bảng `profiles.role`, `class_enrollments`,
`parent_student_links`, `class_teachers`. XP/điểm/huy hiệu chỉ được ghi bởi
service role (qua server action), học viên chỉ có quyền `select` trên dữ liệu
của chính mình.

## 4. Route chính

Đã liệt kê đầy đủ trong yêu cầu gốc (mục 6). Cấu trúc thư mục App Router bám sát
danh sách đó bằng route groups: `(public)`, `(auth)`, `student`, `parent`,
`teacher`, `admin`.

## 5. Rủi ro & giới hạn MVP

- **Next.js 16 breaking changes**: `params`/`searchParams` là Promise,
  `middleware.ts` đổi thành `proxy.ts` với export `proxy`. Toàn bộ code phải
  tuân thủ API mới; đã xác nhận qua tài liệu đóng gói trong `node_modules/next`.
- **AI Speech Coach**: chưa tích hợp AI thật trong MVP. Chỉ có interface
  `SpeechAnalysisProvider`, type kết quả, mock chạy trong development, feature
  flag `NEXT_PUBLIC_ENABLE_AI_SPEECH_COACH=false`, trang "Sắp ra mắt".
- **Video ghi âm/quay trực tiếp trong trình duyệt**: MVP hỗ trợ tải file lên
  (upload) đầy đủ; quay video/ghi âm trực tiếp bằng MediaRecorder API được cài
  đặt ở mức cơ bản nhưng có thể bị giới hạn bởi trình duyệt/môi trường demo —
  luôn có fallback tải file.
- **Realtime**: không bắt buộc cho MVP; thông báo dùng polling/khi tải lại
  trang thay vì Supabase Realtime để giảm độ phức tạp.
- **E2E test phụ thuộc Supabase thật**: Playwright test cho luồng guest chạy
  không cần backend. Các luồng cần đăng nhập (student/teacher/parent/admin)
  được viết nhưng đánh dấu `test.skip` khi biến môi trường
  `E2E_SUPABASE_TEST_ACCOUNTS` không được cấu hình — tài liệu hướng dẫn cách
  bật khi có môi trường test Supabase riêng.
- **Nội dung thương hiệu chưa xác nhận** (tiểu sử, chứng chỉ, học phí, review
  thật...): dùng placeholder có nhãn rõ ràng, không bịa số liệu, admin có thể
  chỉnh sửa qua `site_settings`/`faq_items`/`testimonials`.
- **Không dùng shadcn CLI** (registry network có thể không ổn định trong môi
  trường build) — component UI được viết tay theo cùng triết lý
  (Radix-less, Tailwind + `cva` + `tailwind-merge`), giữ API tương tự shadcn/ui
  để dễ thay thế sau này.

## 6. Tiêu chí nghiệm thu

Theo đúng mục 40 của yêu cầu gốc — xem báo cáo cuối cùng để đối chiếu từng mục.
