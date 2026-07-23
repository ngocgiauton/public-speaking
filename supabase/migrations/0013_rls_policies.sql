-- Row Level Security cho toàn bộ bảng chứa dữ liệu người dùng.
--
-- Nguyên tắc:
--   * Học viên chỉ xem/sửa dữ liệu của chính mình, KHÔNG được tự sửa điểm,
--     XP, huy hiệu hoặc trạng thái duyệt bài (những cột này chỉ được ghi bởi
--     service role thông qua server action, hoặc bị chặn bằng column grant).
--   * Phụ huynh chỉ xem học viên đã được liên kết (parent_student_links,
--     status = 'active'). Phụ huynh không có quyền UPDATE trên dữ liệu học tập.
--   * Giáo viên chỉ xem/chấm bài của lớp mình phụ trách (class_teachers).
--   * Admin quản lý toàn bộ thông qua policy is_admin().
--   * Service role key (dùng trong lib/supabase/admin.ts) bỏ qua RLS theo
--     mặc định của Supabase — chỉ được dùng ở server action đã kiểm tra vai trò.

-- ---------------------------------------------------------------------------
-- profiles
-- ---------------------------------------------------------------------------
alter table public.profiles enable row level security;

create policy "profiles_select_self_or_related" on public.profiles
  for select using (
    id = auth.uid()
    or public.is_admin()
    or (role = 'student' and (public.is_teacher_of_student(id) or public.is_parent_of_student(id)))
    or (role = 'teacher' and public.is_admin())
  );

create policy "profiles_update_self_limited" on public.profiles
  for update using (id = auth.uid() or public.is_admin())
  with check (id = auth.uid() or public.is_admin());

revoke update on public.profiles from authenticated;
grant update (full_name, avatar_url, phone) on public.profiles to authenticated;

create policy "profiles_admin_all" on public.profiles
  for all using (public.is_admin()) with check (public.is_admin());

-- ---------------------------------------------------------------------------
-- student_profiles / parent_profiles / teacher_profiles / parent_student_links
-- ---------------------------------------------------------------------------
alter table public.student_profiles enable row level security;

create policy "student_profiles_select" on public.student_profiles
  for select using (
    profile_id = auth.uid()
    or public.is_admin()
    or public.is_teacher_of_student(profile_id)
    or public.is_parent_of_student(profile_id)
  );

create policy "student_profiles_update" on public.student_profiles
  for update using (profile_id = auth.uid() or public.is_admin())
  with check (profile_id = auth.uid() or public.is_admin());

-- Học viên chỉ được sửa các trường hồ sơ cơ bản — total_xp, streak,
-- current_academic_level_id chỉ được cập nhật bởi trigger/service role.
revoke update on public.student_profiles from authenticated;
grant update (school, english_level, baseline_note) on public.student_profiles to authenticated;

create policy "student_profiles_admin_all" on public.student_profiles
  for all using (public.is_admin()) with check (public.is_admin());

alter table public.parent_profiles enable row level security;

create policy "parent_profiles_select" on public.parent_profiles
  for select using (profile_id = auth.uid() or public.is_admin());

create policy "parent_profiles_update_self" on public.parent_profiles
  for update using (profile_id = auth.uid() or public.is_admin())
  with check (profile_id = auth.uid() or public.is_admin());

create policy "parent_profiles_admin_all" on public.parent_profiles
  for all using (public.is_admin()) with check (public.is_admin());

alter table public.teacher_profiles enable row level security;

create policy "teacher_profiles_select" on public.teacher_profiles
  for select using (
    profile_id = auth.uid() or public.is_admin() or auth.role() = 'authenticated'
  );

create policy "teacher_profiles_update_self" on public.teacher_profiles
  for update using (profile_id = auth.uid() or public.is_admin())
  with check (profile_id = auth.uid() or public.is_admin());

create policy "teacher_profiles_admin_all" on public.teacher_profiles
  for all using (public.is_admin()) with check (public.is_admin());

alter table public.parent_student_links enable row level security;

create policy "parent_student_links_select" on public.parent_student_links
  for select using (
    parent_profile_id = auth.uid()
    or student_profile_id = auth.uid()
    or public.is_admin()
    or public.is_teacher_of_student(student_profile_id)
  );

create policy "parent_student_links_admin_write" on public.parent_student_links
  for all using (public.is_admin()) with check (public.is_admin());

-- ---------------------------------------------------------------------------
-- courses / course_levels / lessons / lesson_sections / lesson_resources /
-- lesson_prerequisites — công khai đọc nội dung đã publish, chỉ admin ghi.
-- ---------------------------------------------------------------------------
alter table public.courses enable row level security;
create policy "courses_public_read" on public.courses
  for select using (is_published or public.is_admin());
create policy "courses_admin_write" on public.courses
  for all using (public.is_admin()) with check (public.is_admin());

alter table public.course_levels enable row level security;
create policy "course_levels_public_read" on public.course_levels
  for select using (
    public.is_admin() or exists (
      select 1 from public.courses c where c.id = course_id and c.is_published
    )
  );
create policy "course_levels_admin_write" on public.course_levels
  for all using (public.is_admin()) with check (public.is_admin());

alter table public.lessons enable row level security;
create policy "lessons_read" on public.lessons
  for select using (is_published or public.is_admin());
create policy "lessons_admin_write" on public.lessons
  for all using (public.is_admin()) with check (public.is_admin());

alter table public.lesson_sections enable row level security;
create policy "lesson_sections_read" on public.lesson_sections
  for select using (
    public.is_admin() or exists (
      select 1 from public.lessons l where l.id = lesson_id and l.is_published
    )
  );
create policy "lesson_sections_admin_write" on public.lesson_sections
  for all using (public.is_admin()) with check (public.is_admin());

alter table public.lesson_resources enable row level security;
create policy "lesson_resources_read" on public.lesson_resources
  for select using (
    public.is_admin() or exists (
      select 1 from public.lessons l where l.id = lesson_id and l.is_published
    )
  );
create policy "lesson_resources_admin_write" on public.lesson_resources
  for all using (public.is_admin()) with check (public.is_admin());

alter table public.lesson_prerequisites enable row level security;
create policy "lesson_prerequisites_read" on public.lesson_prerequisites
  for select using (true);
create policy "lesson_prerequisites_admin_write" on public.lesson_prerequisites
  for all using (public.is_admin()) with check (public.is_admin());

-- ---------------------------------------------------------------------------
-- classes / class_teachers / class_enrollments
-- ---------------------------------------------------------------------------
alter table public.classes enable row level security;
create policy "classes_select" on public.classes
  for select using (
    public.is_admin()
    or public.is_teacher_of_class(id)
    or exists (
      select 1 from public.class_enrollments ce
      where ce.class_id = id and ce.student_profile_id = auth.uid()
    )
    or exists (
      select 1 from public.class_enrollments ce
      where ce.class_id = id and public.is_parent_of_student(ce.student_profile_id)
    )
  );
create policy "classes_admin_write" on public.classes
  for all using (public.is_admin()) with check (public.is_admin());

alter table public.class_teachers enable row level security;
create policy "class_teachers_select" on public.class_teachers
  for select using (
    teacher_profile_id = auth.uid() or public.is_admin() or public.is_teacher_of_class(class_id)
  );
create policy "class_teachers_admin_write" on public.class_teachers
  for all using (public.is_admin()) with check (public.is_admin());

alter table public.class_enrollments enable row level security;
create policy "class_enrollments_select" on public.class_enrollments
  for select using (
    student_profile_id = auth.uid()
    or public.is_admin()
    or public.is_teacher_of_class(class_id)
    or public.is_parent_of_student(student_profile_id)
  );
create policy "class_enrollments_admin_write" on public.class_enrollments
  for all using (public.is_admin()) with check (public.is_admin());

-- ---------------------------------------------------------------------------
-- progress
-- ---------------------------------------------------------------------------
alter table public.student_lesson_progress enable row level security;
create policy "lesson_progress_select" on public.student_lesson_progress
  for select using (
    student_profile_id = auth.uid()
    or public.is_admin()
    or public.is_teacher_of_student(student_profile_id)
    or public.is_parent_of_student(student_profile_id)
  );
-- Không có policy insert/update cho vai trò authenticated: status, quiz_passed
-- và assignment_status đều là kết quả suy ra từ quiz/bài nộp đã được server
-- xác thực, nên chỉ service role (server action) mới được ghi bảng này.

alter table public.video_watch_progress enable row level security;
create policy "video_watch_select" on public.video_watch_progress
  for select using (
    student_profile_id = auth.uid()
    or public.is_admin()
    or public.is_teacher_of_student(student_profile_id)
    or public.is_parent_of_student(student_profile_id)
  );
create policy "video_watch_write_own" on public.video_watch_progress
  for insert with check (student_profile_id = auth.uid());
create policy "video_watch_update_own" on public.video_watch_progress
  for update using (student_profile_id = auth.uid() or public.is_admin())
  with check (student_profile_id = auth.uid() or public.is_admin());

alter table public.learning_sessions enable row level security;
create policy "learning_sessions_select" on public.learning_sessions
  for select using (
    student_profile_id = auth.uid() or public.is_admin() or public.is_teacher_of_student(student_profile_id)
  );
create policy "learning_sessions_insert_own" on public.learning_sessions
  for insert with check (student_profile_id = auth.uid());
create policy "learning_sessions_update_own" on public.learning_sessions
  for update using (student_profile_id = auth.uid()) with check (student_profile_id = auth.uid());

alter table public.streaks enable row level security;
create policy "streaks_select" on public.streaks
  for select using (
    student_profile_id = auth.uid() or public.is_admin() or public.is_parent_of_student(student_profile_id)
  );
create policy "streaks_insert_own" on public.streaks
  for insert with check (student_profile_id = auth.uid());

-- ---------------------------------------------------------------------------
-- quizzes — nội dung do admin quản lý, học viên chỉ đọc quiz đã publish của
-- bài học đã mở khóa (kiểm tra mở khóa được thực hiện ở tầng ứng dụng khi
-- hiển thị; RLS chỉ đảm bảo publish + tồn tại lesson công khai).
-- ---------------------------------------------------------------------------
alter table public.quizzes enable row level security;
create policy "quizzes_read" on public.quizzes
  for select using (
    public.is_admin() or (is_published and exists (
      select 1 from public.lessons l where l.id = lesson_id and l.is_published
    ))
  );
create policy "quizzes_admin_write" on public.quizzes
  for all using (public.is_admin()) with check (public.is_admin());

alter table public.quiz_questions enable row level security;
create policy "quiz_questions_read" on public.quiz_questions
  for select using (
    public.is_admin() or exists (
      select 1 from public.quizzes q where q.id = quiz_id and q.is_published
    )
  );
create policy "quiz_questions_admin_write" on public.quiz_questions
  for all using (public.is_admin()) with check (public.is_admin());

alter table public.quiz_options enable row level security;
create policy "quiz_options_read" on public.quiz_options
  for select using (
    public.is_admin() or exists (
      select 1 from public.quiz_questions qq
      join public.quizzes q on q.id = qq.quiz_id
      where qq.id = question_id and q.is_published
    )
  );
create policy "quiz_options_admin_write" on public.quiz_options
  for all using (public.is_admin()) with check (public.is_admin());

alter table public.quiz_attempts enable row level security;
create policy "quiz_attempts_select" on public.quiz_attempts
  for select using (
    student_profile_id = auth.uid()
    or public.is_admin()
    or public.is_teacher_of_student(student_profile_id)
    or public.is_parent_of_student(student_profile_id)
  );
create policy "quiz_attempts_insert_own" on public.quiz_attempts
  for insert with check (student_profile_id = auth.uid());

alter table public.quiz_answers enable row level security;
create policy "quiz_answers_select" on public.quiz_answers
  for select using (
    public.is_admin()
    or exists (
      select 1 from public.quiz_attempts qa
      where qa.id = attempt_id
        and (qa.student_profile_id = auth.uid() or public.is_teacher_of_student(qa.student_profile_id))
    )
  );
create policy "quiz_answers_insert_own" on public.quiz_answers
  for insert with check (
    exists (
      select 1 from public.quiz_attempts qa
      where qa.id = attempt_id and qa.student_profile_id = auth.uid()
    )
  );

-- ---------------------------------------------------------------------------
-- assignments / rubric criteria — admin quản lý, đọc công khai theo lesson.
-- ---------------------------------------------------------------------------
alter table public.assignments enable row level security;
create policy "assignments_read" on public.assignments
  for select using (
    public.is_admin() or (is_published and exists (
      select 1 from public.lessons l where l.id = lesson_id and l.is_published
    ))
  );
create policy "assignments_admin_write" on public.assignments
  for all using (public.is_admin()) with check (public.is_admin());

alter table public.assignment_rubric_criteria enable row level security;
create policy "assignment_rubric_criteria_read" on public.assignment_rubric_criteria
  for select using (true);
create policy "assignment_rubric_criteria_admin_write" on public.assignment_rubric_criteria
  for all using (public.is_admin()) with check (public.is_admin());

-- ---------------------------------------------------------------------------
-- submissions — trọng tâm bảo mật: học viên chỉ thấy bài của mình; giáo viên
-- chỉ thấy/chấm bài của lớp mình phụ trách; không ai được tự sửa best_score
-- hay status ngoại trừ qua quy trình review (server action dùng service role
-- sau khi kiểm tra vai trò).
-- ---------------------------------------------------------------------------
alter table public.submissions enable row level security;
create policy "submissions_select" on public.submissions
  for select using (
    student_profile_id = auth.uid()
    or public.is_admin()
    or public.is_teacher_of_student(student_profile_id)
    or public.is_parent_of_student(student_profile_id)
  );
create policy "submissions_insert_own" on public.submissions
  for insert with check (student_profile_id = auth.uid());
create policy "submissions_update_own_draft" on public.submissions
  for update using (
    (student_profile_id = auth.uid() and status in ('draft', 'revision_requested', 'rejected'))
    or public.is_admin()
    or public.is_teacher_of_student(student_profile_id)
  )
  with check (
    (student_profile_id = auth.uid() and status in ('draft', 'submitted', 'resubmitted'))
    or public.is_admin()
    or public.is_teacher_of_student(student_profile_id)
  );

revoke update on public.submissions from authenticated;
grant update (title, notes, status, submitted_at, attempt_number) on public.submissions to authenticated;

alter table public.submission_files enable row level security;
create policy "submission_files_select" on public.submission_files
  for select using (
    public.is_admin()
    or exists (
      select 1 from public.submissions s
      where s.id = submission_id
        and (s.student_profile_id = auth.uid() or public.is_teacher_of_student(s.student_profile_id))
    )
  );
create policy "submission_files_insert_own" on public.submission_files
  for insert with check (
    exists (
      select 1 from public.submissions s
      where s.id = submission_id and s.student_profile_id = auth.uid()
        and s.status in ('draft', 'revision_requested', 'rejected')
    )
  );
create policy "submission_files_delete_own_draft" on public.submission_files
  for delete using (
    exists (
      select 1 from public.submissions s
      where s.id = submission_id and s.student_profile_id = auth.uid()
        and s.status in ('draft', 'revision_requested', 'rejected')
    )
    or public.is_admin()
  );

alter table public.submission_reviews enable row level security;
create policy "submission_reviews_select" on public.submission_reviews
  for select using (
    public.is_admin()
    or teacher_profile_id = auth.uid()
    or exists (
      select 1 from public.submissions s
      where s.id = submission_id
        and (s.student_profile_id = auth.uid() or public.is_parent_of_student(s.student_profile_id))
    )
  );
create policy "submission_reviews_insert_teacher" on public.submission_reviews
  for insert with check (
    teacher_profile_id = auth.uid()
    and exists (
      select 1 from public.submissions s
      where s.id = submission_id and public.is_teacher_of_student(s.student_profile_id)
    )
  );

alter table public.submission_scores enable row level security;
create policy "submission_scores_select" on public.submission_scores
  for select using (
    public.is_admin()
    or exists (
      select 1 from public.submission_reviews r
      join public.submissions s on s.id = r.submission_id
      where r.id = submission_review_id
        and (
          r.teacher_profile_id = auth.uid()
          or s.student_profile_id = auth.uid()
          or public.is_parent_of_student(s.student_profile_id)
        )
    )
  );
create policy "submission_scores_insert_teacher" on public.submission_scores
  for insert with check (
    exists (
      select 1 from public.submission_reviews r
      where r.id = submission_review_id and r.teacher_profile_id = auth.uid()
    )
  );

alter table public.submission_comments enable row level security;
create policy "submission_comments_select" on public.submission_comments
  for select using (
    public.is_admin()
    or exists (
      select 1 from public.submissions s
      where s.id = submission_id
        and (
          s.student_profile_id = auth.uid()
          or public.is_teacher_of_student(s.student_profile_id)
          or public.is_parent_of_student(s.student_profile_id)
        )
    )
  );
create policy "submission_comments_insert" on public.submission_comments
  for insert with check (
    author_profile_id = auth.uid()
    and exists (
      select 1 from public.submissions s
      where s.id = submission_id
        and (s.student_profile_id = auth.uid() or public.is_teacher_of_student(s.student_profile_id))
    )
  );

-- ---------------------------------------------------------------------------
-- gamification — XP/rank/badge chỉ được ghi bởi service role (server
-- actions), học viên/phụ huynh/giáo viên chỉ có quyền đọc.
-- ---------------------------------------------------------------------------
alter table public.xp_transactions enable row level security;
create policy "xp_transactions_select" on public.xp_transactions
  for select using (
    student_profile_id = auth.uid()
    or public.is_admin()
    or public.is_teacher_of_student(student_profile_id)
    or public.is_parent_of_student(student_profile_id)
  );
-- Không có policy insert/update/delete cho authenticated: chỉ service role
-- (bỏ qua RLS) mới ghi được xp_transactions.

alter table public.student_ranks enable row level security;
create policy "student_ranks_select" on public.student_ranks
  for select using (
    student_profile_id = auth.uid()
    or public.is_admin()
    or public.is_teacher_of_student(student_profile_id)
    or public.is_parent_of_student(student_profile_id)
  );

alter table public.badges enable row level security;
create policy "badges_read" on public.badges for select using (true);
create policy "badges_admin_write" on public.badges
  for all using (public.is_admin()) with check (public.is_admin());

alter table public.student_badges enable row level security;
create policy "student_badges_select" on public.student_badges
  for select using (
    student_profile_id = auth.uid()
    or public.is_admin()
    or public.is_teacher_of_student(student_profile_id)
    or public.is_parent_of_student(student_profile_id)
  );
-- Ghi huy hiệu chỉ qua service role.

-- ---------------------------------------------------------------------------
-- certificates
-- ---------------------------------------------------------------------------
alter table public.certificates enable row level security;
create policy "certificates_read" on public.certificates
  for select using (is_active or public.is_admin());
create policy "certificates_admin_write" on public.certificates
  for all using (public.is_admin()) with check (public.is_admin());

alter table public.student_certificates enable row level security;
create policy "student_certificates_select" on public.student_certificates
  for select using (
    student_profile_id = auth.uid() or public.is_admin() or public.is_parent_of_student(student_profile_id)
  );

-- ---------------------------------------------------------------------------
-- communication
-- ---------------------------------------------------------------------------
alter table public.announcements enable row level security;
create policy "announcements_select" on public.announcements
  for select using (
    public.is_admin()
    or author_profile_id = auth.uid()
    or (class_id is null)
    or public.is_teacher_of_class(class_id)
    or exists (
      select 1 from public.class_enrollments ce
      where ce.class_id = class_id and ce.student_profile_id = auth.uid()
    )
  );
create policy "announcements_insert_teacher_admin" on public.announcements
  for insert with check (
    author_profile_id = auth.uid()
    and (public.is_admin() or (class_id is not null and public.is_teacher_of_class(class_id)))
  );

alter table public.notifications enable row level security;
create policy "notifications_select_own" on public.notifications
  for select using (recipient_profile_id = auth.uid() or public.is_admin());
create policy "notifications_update_own" on public.notifications
  for update using (recipient_profile_id = auth.uid())
  with check (recipient_profile_id = auth.uid());

-- ---------------------------------------------------------------------------
-- website & lead — form công khai chỉ được insert, không được đọc lại; admin
-- toàn quyền quản lý.
-- ---------------------------------------------------------------------------
alter table public.consultation_leads enable row level security;
create policy "consultation_leads_insert_public" on public.consultation_leads
  for insert to anon, authenticated with check (true);
create policy "consultation_leads_admin_all" on public.consultation_leads
  for all using (public.is_admin()) with check (public.is_admin());

alter table public.site_settings enable row level security;
create policy "site_settings_public_read" on public.site_settings
  for select using (true);
create policy "site_settings_admin_write" on public.site_settings
  for all using (public.is_admin()) with check (public.is_admin());

alter table public.faq_items enable row level security;
create policy "faq_items_public_read" on public.faq_items
  for select using (is_published or public.is_admin());
create policy "faq_items_admin_write" on public.faq_items
  for all using (public.is_admin()) with check (public.is_admin());

alter table public.testimonials enable row level security;
create policy "testimonials_public_read" on public.testimonials
  for select using (is_published or public.is_admin());
create policy "testimonials_admin_write" on public.testimonials
  for all using (public.is_admin()) with check (public.is_admin());
