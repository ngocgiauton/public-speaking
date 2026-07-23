-- Bài tập và bài nộp.

create table if not exists public.assignments (
  id uuid primary key default gen_random_uuid(),
  lesson_id uuid not null references public.lessons (id) on delete cascade,
  title text not null,
  description text,
  instructions text,
  assignment_type text not null default 'main' check (assignment_type in ('main', 'practice')),
  allowed_media jsonb not null default '["video", "audio"]'::jsonb,
  max_video_mb integer not null default 200,
  max_audio_mb integer not null default 50,
  due_offset_days integer,
  min_pass_score integer not null default 70,
  xp_reward integer not null default 50,
  is_published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists assignments_lesson_idx on public.assignments (lesson_id);

create trigger assignments_set_updated_at
  before update on public.assignments
  for each row execute function public.set_updated_at();

-- Tập con tiêu chí rubric mà assignment này sử dụng (tổng rubric đầy đủ là 100
-- điểm, nhưng không bắt buộc mọi bài phải dùng hết).
create table if not exists public.assignment_rubric_criteria (
  id uuid primary key default gen_random_uuid(),
  assignment_id uuid not null references public.assignments (id) on delete cascade,
  criterion_key text not null,
  group_key text not null,
  label text not null,
  max_score integer not null,
  order_index integer not null default 0,
  unique (assignment_id, criterion_key)
);

create index if not exists assignment_rubric_criteria_assignment_idx on public.assignment_rubric_criteria (assignment_id);

create table if not exists public.submissions (
  id uuid primary key default gen_random_uuid(),
  assignment_id uuid not null references public.assignments (id) on delete cascade,
  student_profile_id uuid not null references public.student_profiles (profile_id) on delete cascade,
  class_id uuid references public.classes (id) on delete set null,
  title text,
  notes text,
  status text not null default 'draft' check (
    status in (
      'draft', 'submitted', 'under_review', 'revision_requested',
      'resubmitted', 'approved', 'rejected'
    )
  ),
  attempt_number integer not null default 1,
  due_at timestamptz,
  submitted_at timestamptz,
  best_score integer,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists submissions_student_idx on public.submissions (student_profile_id);
create index if not exists submissions_assignment_idx on public.submissions (assignment_id);
create index if not exists submissions_status_idx on public.submissions (status);

create trigger submissions_set_updated_at
  before update on public.submissions
  for each row execute function public.set_updated_at();

create table if not exists public.submission_files (
  id uuid primary key default gen_random_uuid(),
  submission_id uuid not null references public.submissions (id) on delete cascade,
  file_type text not null check (file_type in ('video', 'audio')),
  storage_path text not null,
  original_filename text,
  mime_type text,
  size_bytes bigint,
  created_at timestamptz not null default now()
);

create index if not exists submission_files_submission_idx on public.submission_files (submission_id);

-- Mỗi lần giáo viên chấm là một "review round".
create table if not exists public.submission_reviews (
  id uuid primary key default gen_random_uuid(),
  submission_id uuid not null references public.submissions (id) on delete cascade,
  teacher_profile_id uuid not null references public.teacher_profiles (profile_id) on delete restrict,
  overall_comment text,
  strengths text,
  improvements text,
  decision text not null check (decision in ('approved', 'revision_requested', 'rejected')),
  total_score integer not null default 0,
  reviewed_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create index if not exists submission_reviews_submission_idx on public.submission_reviews (submission_id);
create index if not exists submission_reviews_teacher_idx on public.submission_reviews (teacher_profile_id);

create table if not exists public.submission_scores (
  id uuid primary key default gen_random_uuid(),
  submission_review_id uuid not null references public.submission_reviews (id) on delete cascade,
  criterion_key text not null,
  group_key text not null,
  score integer not null,
  max_score integer not null,
  created_at timestamptz not null default now()
);

create index if not exists submission_scores_review_idx on public.submission_scores (submission_review_id);

create table if not exists public.submission_comments (
  id uuid primary key default gen_random_uuid(),
  submission_id uuid not null references public.submissions (id) on delete cascade,
  author_profile_id uuid not null references public.profiles (id) on delete cascade,
  comment_text text not null,
  created_at timestamptz not null default now()
);

create index if not exists submission_comments_submission_idx on public.submission_comments (submission_id);
