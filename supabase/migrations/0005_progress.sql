-- Tiến độ học tập.

create table if not exists public.student_lesson_progress (
  id uuid primary key default gen_random_uuid(),
  student_profile_id uuid not null references public.student_profiles (profile_id) on delete cascade,
  lesson_id uuid not null references public.lessons (id) on delete cascade,
  status text not null default 'locked' check (
    status in ('locked', 'available', 'in_progress', 'completed', 'needs_revision')
  ),
  video_completed boolean not null default false,
  knowledge_completed boolean not null default false,
  quiz_passed boolean not null default false,
  assignment_status text not null default 'not_submitted' check (
    assignment_status in (
      'not_submitted', 'draft', 'submitted', 'under_review',
      'revision_requested', 'resubmitted', 'approved', 'rejected'
    )
  ),
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (student_profile_id, lesson_id)
);

create index if not exists student_lesson_progress_student_idx on public.student_lesson_progress (student_profile_id);
create index if not exists student_lesson_progress_lesson_idx on public.student_lesson_progress (lesson_id);

create trigger student_lesson_progress_set_updated_at
  before update on public.student_lesson_progress
  for each row execute function public.set_updated_at();

create table if not exists public.video_watch_progress (
  id uuid primary key default gen_random_uuid(),
  student_profile_id uuid not null references public.student_profiles (profile_id) on delete cascade,
  lesson_id uuid not null references public.lessons (id) on delete cascade,
  watched_seconds integer not null default 0,
  total_seconds integer not null default 0,
  watch_percent integer not null default 0,
  completed boolean not null default false,
  updated_at timestamptz not null default now(),
  unique (student_profile_id, lesson_id)
);

create trigger video_watch_progress_set_updated_at
  before update on public.video_watch_progress
  for each row execute function public.set_updated_at();

create table if not exists public.learning_sessions (
  id uuid primary key default gen_random_uuid(),
  student_profile_id uuid not null references public.student_profiles (profile_id) on delete cascade,
  activity_type text not null check (
    activity_type in ('lesson_view', 'quiz', 'assignment', 'practice')
  ),
  lesson_id uuid references public.lessons (id) on delete set null,
  started_at timestamptz not null default now(),
  ended_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists learning_sessions_student_idx on public.learning_sessions (student_profile_id);

-- Một dòng mỗi ngày học viên có hoạt động — dùng để tính chuỗi ngày học liên
-- tiếp (streak), thay vì chỉ lưu một con số tổng.
create table if not exists public.streaks (
  id uuid primary key default gen_random_uuid(),
  student_profile_id uuid not null references public.student_profiles (profile_id) on delete cascade,
  activity_date date not null,
  created_at timestamptz not null default now(),
  unique (student_profile_id, activity_date)
);

create index if not exists streaks_student_idx on public.streaks (student_profile_id, activity_date desc);
