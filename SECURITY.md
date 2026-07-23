# Bảo mật — Public Speaking – Diễn Giả Nhí

Tài liệu này mô tả các nguyên tắc bảo mật đã triển khai trong MVP và những
giới hạn đã biết. Xem thêm `docs/RLS.md` để hiểu chi tiết về Row Level
Security.

## Nguyên tắc thiết kế

1. **Không tin dữ liệu từ client.** Vai trò người dùng (role) không bao giờ
   được đọc từ request body hay client state để cấp quyền — mọi kiểm tra vai
   trò đều truy vấn bảng `profiles` phía server (`lib/auth/session.ts`) hoặc
   thông qua RLS (`public.is_admin()`, `public.is_teacher_of_student()`...).
2. **Hai lớp phòng vệ (defense in depth).**
   - Lớp 1 — Row Level Security ở Supabase: đảm bảo ngay cả khi tầng ứng dụng
     có lỗi, một truy vấn trực tiếp từ client (anon/authenticated key) vẫn bị
     giới hạn đúng theo vai trò.
   - Lớp 2 — Kiểm tra vai trò ở Server Component/Server Action
     (`requireRole()`), tạo trải nghiệm chuyển hướng phù hợp và tránh phải
     round-trip không cần thiết tới database chỉ để render UI.
3. **XP, huy hiệu, rank, trạng thái duyệt bài không thể bị học viên tự sửa.**
   - RLS không cấp quyền INSERT/UPDATE trên `xp_transactions`,
     `student_badges`, `student_ranks` cho vai trò `authenticated`.
   - Cột `total_xp`, `current_streak_days`, `current_academic_level_id` trên
     `student_profiles` bị chặn ghi qua column-level `GRANT` (xem
     `supabase/migrations/0013_rls_policies.sql`), dù học viên có quyền
     UPDATE hàng dữ liệu của chính mình cho các trường hồ sơ khác.
   - Mọi thay đổi XP đều đi qua `src/features/gamification/engine.ts`, dùng
     service role key sau khi server action đã tự xác thực logic nghiệp vụ
     (ví dụ: quiz được chấm đúng ở server, giáo viên đã xác nhận duyệt bài).
4. **Service role key chỉ tồn tại phía server.** `lib/supabase/admin.ts` có
   `import "server-only"` — Next.js sẽ báo lỗi build nếu file này vô tình bị
   import vào Client Component. Key được đọc từ `SUPABASE_SERVICE_ROLE_KEY`,
   không có tiền tố `NEXT_PUBLIC_`, không commit vào repository.
5. **Chống IDOR.** Mọi trang chi tiết theo ID (bài học, bài nộp, học viên...)
   đều kiểm tra quyền sở hữu/liên kết trước khi hiển thị dữ liệu:
   `verifyTeacherOwnsStudent()`, `verifyParentOwnsStudent()`,
   `verifyTeacherOwnsClass()` — không chỉ dựa vào việc "URL không đoán được".
6. **Upload file.**
   - Kiểm tra MIME type và dung lượng cả ở client (`lib/storage/upload.ts`,
     UX nhanh) lẫn ở Supabase Storage bucket config (`file_size_limit`,
     `allowed_mime_types` — nguồn sự thật, không thể bị client bypass).
   - Tên file được sinh lại bằng `crypto.randomUUID()`
     (`generateSafeFileName`) — không bao giờ dùng tên file gốc do người
     dùng gửi lên để tránh path traversal hoặc trùng lặp.
   - Đường dẫn lưu trữ bắt buộc bắt đầu bằng `{profile_id hoặc
     student_profile_id}/...` — policy Storage RLS so khớp với `auth.uid()`
     dựa trên cấu trúc thư mục, không tin metadata do client gửi lên.
   - `submission-media` là bucket private tuyệt đối; giáo viên/phụ huynh chỉ
     xem được qua signed URL có thời hạn (`createSignedUrl`, xem
     `src/app/teacher/cham-bai/[submissionId]/page.tsx`).
7. **Validation.** Mọi input ghi vào database đều được xác thực bằng Zod ở
   server action (`features/*/schema.ts`) — validation phía client chỉ là
   trải nghiệm người dùng, không phải ranh giới bảo mật.
8. **Rate limiting cơ bản.** Form đăng ký tư vấn công khai giới hạn 1 lần gửi
   mỗi IP mỗi phút (in-memory, xem `features/leads/actions.ts`) để giảm spam.
   Đây là giải pháp phù hợp cho MVP một instance; khi scale ra nhiều instance
   cần chuyển sang giải pháp rate-limit tập trung (ví dụ Upstash Redis).
9. **Không lộ thông tin nhạy cảm qua thông báo lỗi.** Người dùng cuối chỉ
   thấy thông báo lỗi tiếng Việt chung chung; không hiển thị stack trace hay
   chi tiết lỗi database.
10. **Đặt lại mật khẩu không lộ thông tin tài khoản.** `requestPasswordResetAction`
    luôn trả về cùng một thông báo thành công dù email có tồn tại hay không.

## Giới hạn đã biết của MVP

- **Rate limiting** chỉ áp dụng cho form đăng ký tư vấn, dùng bộ nhớ trong
  tiến trình (không bền vững qua nhiều instance/serverless cold start). Đăng
  nhập hiện dựa vào cơ chế giới hạn mặc định của Supabase Auth; chưa có rate
  limit bổ sung riêng ở tầng ứng dụng.
- **Email xác thực (email verification)** khi đăng ký tài khoản mới do admin
  tạo dùng `email_confirm: true` (bỏ qua bước xác minh) để đơn giản hóa luồng
  demo — trong triển khai thực tế nên cân nhắc bật xác minh email thật.
- **Không có audit log riêng biệt** cho các hành động quản trị nhạy cảm
  (đổi vai trò, khóa tài khoản) ngoài `updated_at`/lịch sử `xp_transactions`
  — nên bổ sung bảng audit log chuyên dụng trước khi vận hành thực tế ở quy
  mô lớn.
- **AI Speech Coach chưa tích hợp** — chỉ có interface, mock provider chỉ
  chạy trong development và tự chặn nếu bị gọi ở production
  (`MockSpeechAnalysisProvider`).

## Báo cáo lỗ hổng bảo mật

Nếu phát hiện lỗ hổng bảo mật, vui lòng liên hệ trực tiếp với quản trị viên
dự án thay vì tạo issue công khai.
