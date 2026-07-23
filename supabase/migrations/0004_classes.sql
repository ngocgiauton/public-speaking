-- Lớp học.

create table if not exists public.classes (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses (id) on delete restrict,
  name text not null,
  status text not null default 'active' check (status in ('active', 'completed', 'archived')),
  start_date date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger classes_set_updated_at
  before update on public.classes
  for each row execute function public.set_updated_at();

create table if not exists public.class_teachers (
  id uuid primary key default gen_random_uuid(),
  class_id uuid not null references public.classes (id) on delete cascade,
  teacher_profile_id uuid not null references public.teacher_profiles (profile_id) on delete cascade,
  role text not null default 'main' check (role in ('main', 'assistant')),
  created_at timestamptz not null default now(),
  unique (class_id, teacher_profile_id)
);

create index if not exists class_teachers_teacher_idx on public.class_teachers (teacher_profile_id);
create index if not exists class_teachers_class_idx on public.class_teachers (class_id);

create table if not exists public.class_enrollments (
  id uuid primary key default gen_random_uuid(),
  class_id uuid not null references public.classes (id) on delete cascade,
  student_profile_id uuid not null references public.student_profiles (profile_id) on delete cascade,
  status text not null default 'active' check (status in ('active', 'completed', 'withdrawn')),
  enrolled_at timestamptz not null default now(),
  unique (class_id, student_profile_id)
);

create index if not exists class_enrollments_student_idx on public.class_enrollments (student_profile_id);
create index if not exists class_enrollments_class_idx on public.class_enrollments (class_id);
