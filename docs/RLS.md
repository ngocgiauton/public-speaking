# Row Level Security — tóm tắt

Toàn bộ bảng chứa dữ liệu người dùng trong `supabase/migrations/0013_rls_policies.sql`
đều bật RLS. Nguyên tắc áp dụng:

## Vai trò và phạm vi truy cập

| Vai trò | Phạm vi đọc | Phạm vi ghi |
|---|---|---|
| Học viên | Dữ liệu của chính mình (`profile_id = auth.uid()`) | Chỉ các trường hồ sơ cơ bản (không XP, không điểm, không trạng thái duyệt) |
| Phụ huynh | Học viên đã liên kết qua `parent_student_links` với `status = 'active'` | Không được ghi dữ liệu học tập |
| Giáo viên | Học viên thuộc lớp mình phụ trách (`class_teachers` → `class_enrollments`) | Chỉ `submission_reviews`/`submission_scores` cho bài của lớp mình |
| Admin | Toàn bộ | Toàn bộ (qua hàm `is_admin()`) |

## Cơ chế kỹ thuật

1. **Hàm `security definer`** (`is_admin()`, `is_teacher_of_class()`,
   `is_teacher_of_student()`, `is_parent_of_student()`, `current_role()`) tránh
   truy vấn đệ quy policy và tập trung logic kiểm tra vai trò ở một nơi duy nhất.
2. **Column-level GRANT**: với `profiles`, `student_profiles`, `submissions`,
   ta `revoke update` mặc định rồi `grant update` lại chỉ trên các cột được
   phép tự sửa. Ví dụ học viên có quyền UPDATE trên `student_profiles` (theo
   row policy), nhưng cột `total_xp`, `current_academic_level_id`,
   `current_streak_days` không nằm trong tập cột được cấp quyền — Postgres sẽ
   từ chối câu lệnh UPDATE nào đụng tới các cột đó, kể cả khi request được gửi
   trực tiếp từ client đã có JWT hợp lệ.
3. **XP/badge/rank chỉ ghi bằng service role**: các bảng `xp_transactions`,
   `student_badges`, `student_ranks` không có policy INSERT/UPDATE cho vai trò
   `authenticated` — chỉ server action dùng `lib/supabase/admin.ts` (service
   role key, bỏ qua RLS) mới ghi được, sau khi đã tự kiểm tra vai trò người gọi
   ở tầng ứng dụng.
4. **Submissions**: học viên chỉ được `UPDATE` khi `status` đang là `draft`
   hoặc `revision_requested`; một khi đã `submitted`, học viên không thể tự ý
   sửa nội dung bài nộp — đúng yêu cầu "không sửa bài đã nộp trừ khi giáo viên
   yêu cầu làm lại".
5. **Storage**: đường dẫn file bắt buộc theo quy ước
   `{bucket}/{profile_id hoặc student_profile_id}/...`, policy trên
   `storage.objects` dùng `storage.foldername(name)` để so khớp
   `auth.uid()` — không tin tên file do client tự đặt để suy ra quyền truy cập.
6. **Form công khai** (`consultation_leads`): cho phép `INSERT` với vai trò
   `anon`/`authenticated` nhưng KHÔNG có policy `SELECT` cho hai vai trò này —
   khách gửi form không thể đọc lại danh sách lead của người khác.

## Giới hạn

- RLS là lớp bảo vệ dữ liệu chính, nhưng ứng dụng vẫn kiểm tra vai trò ở
  server component/server action như lớp phòng vệ thứ hai (defense in depth).
- Một số kiểm tra nghiệp vụ phức tạp (vd. điều kiện mở khóa bài học) được thực
  hiện ở tầng ứng dụng (`src/features/progress/unlock.ts`) thay vì trong RLS,
  vì đây là logic hiển thị/UX chứ không phải ranh giới bảo mật dữ liệu.
