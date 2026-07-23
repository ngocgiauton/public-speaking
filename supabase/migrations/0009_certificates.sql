-- Chứng nhận.

create table if not exists public.certificates (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses (id) on delete cascade,
  name text not null,
  description text,
  template_url text,
  criteria jsonb not null default '{}'::jsonb,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger certificates_set_updated_at
  before update on public.certificates
  for each row execute function public.set_updated_at();

create table if not exists public.student_certificates (
  id uuid primary key default gen_random_uuid(),
  student_profile_id uuid not null references public.student_profiles (profile_id) on delete cascade,
  certificate_id uuid not null references public.certificates (id) on delete cascade,
  certificate_number text not null unique,
  file_path text,
  issued_at timestamptz not null default now(),
  unique (student_profile_id, certificate_id)
);

create index if not exists student_certificates_student_idx on public.student_certificates (student_profile_id);
