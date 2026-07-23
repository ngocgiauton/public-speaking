-- Khóa học, level học thuật, bài học.

create table if not exists public.courses (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  description text,
  is_published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger courses_set_updated_at
  before update on public.courses
  for each row execute function public.set_updated_at();

create table if not exists public.course_levels (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses (id) on delete cascade,
  order_index integer not null check (order_index between 0 and 5),
  slug text not null,
  name text not null,
  description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (course_id, order_index)
);

create trigger course_levels_set_updated_at
  before update on public.course_levels
  for each row execute function public.set_updated_at();

alter table public.student_profiles
  add constraint student_profiles_current_level_fkey
  foreign key (current_academic_level_id) references public.course_levels (id) on delete set null;

create table if not exists public.lessons (
  id uuid primary key default gen_random_uuid(),
  course_level_id uuid not null references public.course_levels (id) on delete cascade,
  slug text not null unique,
  session_number integer not null unique,
  title text not null,
  short_description text,
  duration_minutes integer not null default 30,
  objectives jsonb not null default '[]'::jsonb,
  key_takeaways jsonb not null default '[]'::jsonb,
  video_url text,
  video_watch_threshold_percent integer not null default 80,
  xp_reward integer not null default 10,
  unlock_rules jsonb not null default '{}'::jsonb,
  is_published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists lessons_course_level_idx on public.lessons (course_level_id);

create trigger lessons_set_updated_at
  before update on public.lessons
  for each row execute function public.set_updated_at();

create table if not exists public.lesson_sections (
  id uuid primary key default gen_random_uuid(),
  lesson_id uuid not null references public.lessons (id) on delete cascade,
  title text not null,
  body text not null,
  example_correct text,
  example_incorrect text,
  memory_tip text,
  common_mistake text,
  order_index integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists lesson_sections_lesson_idx on public.lesson_sections (lesson_id);

create trigger lesson_sections_set_updated_at
  before update on public.lesson_sections
  for each row execute function public.set_updated_at();

create table if not exists public.lesson_resources (
  id uuid primary key default gen_random_uuid(),
  lesson_id uuid not null references public.lessons (id) on delete cascade,
  title text not null,
  url text not null,
  resource_type text not null default 'link' check (resource_type in ('link', 'pdf', 'video', 'audio', 'image')),
  order_index integer not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists lesson_resources_lesson_idx on public.lesson_resources (lesson_id);

create table if not exists public.lesson_prerequisites (
  id uuid primary key default gen_random_uuid(),
  lesson_id uuid not null references public.lessons (id) on delete cascade,
  prerequisite_lesson_id uuid not null references public.lessons (id) on delete cascade,
  unique (lesson_id, prerequisite_lesson_id)
);
