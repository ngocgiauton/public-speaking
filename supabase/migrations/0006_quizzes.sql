-- Quiz.

create table if not exists public.quizzes (
  id uuid primary key default gen_random_uuid(),
  lesson_id uuid not null references public.lessons (id) on delete cascade,
  title text not null,
  instructions text,
  pass_score integer not null default 70,
  max_attempts integer,
  is_published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists quizzes_lesson_idx on public.quizzes (lesson_id);

create trigger quizzes_set_updated_at
  before update on public.quizzes
  for each row execute function public.set_updated_at();

create table if not exists public.quiz_questions (
  id uuid primary key default gen_random_uuid(),
  quiz_id uuid not null references public.quizzes (id) on delete cascade,
  question_text text not null,
  question_type text not null check (
    question_type in ('single_choice', 'multiple_choice', 'true_false', 'ordering')
  ),
  explanation text,
  points integer not null default 10,
  order_index integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists quiz_questions_quiz_idx on public.quiz_questions (quiz_id);

create trigger quiz_questions_set_updated_at
  before update on public.quiz_questions
  for each row execute function public.set_updated_at();

create table if not exists public.quiz_options (
  id uuid primary key default gen_random_uuid(),
  question_id uuid not null references public.quiz_questions (id) on delete cascade,
  option_text text not null,
  is_correct boolean not null default false,
  order_index integer not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists quiz_options_question_idx on public.quiz_options (question_id);

create table if not exists public.quiz_attempts (
  id uuid primary key default gen_random_uuid(),
  quiz_id uuid not null references public.quizzes (id) on delete cascade,
  student_profile_id uuid not null references public.student_profiles (profile_id) on delete cascade,
  attempt_number integer not null default 1,
  score integer not null default 0,
  is_passed boolean not null default false,
  started_at timestamptz not null default now(),
  submitted_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists quiz_attempts_student_idx on public.quiz_attempts (student_profile_id, quiz_id);

create table if not exists public.quiz_answers (
  id uuid primary key default gen_random_uuid(),
  attempt_id uuid not null references public.quiz_attempts (id) on delete cascade,
  question_id uuid not null references public.quiz_questions (id) on delete cascade,
  selected_option_ids jsonb not null default '[]'::jsonb,
  is_correct boolean not null default false,
  points_earned integer not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists quiz_answers_attempt_idx on public.quiz_answers (attempt_id);
