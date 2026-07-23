-- Người dùng và hồ sơ theo vai trò.
-- profiles.id tham chiếu auth.users(id): mỗi tài khoản Supabase Auth có đúng
-- một profile ứng dụng với một vai trò (role) duy nhất.

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  role text not null check (role in ('student', 'parent', 'teacher', 'admin')),
  full_name text not null,
  avatar_url text,
  phone text,
  status text not null default 'active' check (status in ('active', 'locked')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists profiles_role_idx on public.profiles (role);

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

create table if not exists public.student_profiles (
  profile_id uuid primary key references public.profiles (id) on delete cascade,
  date_of_birth date,
  school text,
  english_level text,
  current_academic_level_id uuid,
  total_xp integer not null default 0,
  current_streak_days integer not null default 0,
  longest_streak_days integer not null default 0,
  last_active_date date,
  baseline_note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger student_profiles_set_updated_at
  before update on public.student_profiles
  for each row execute function public.set_updated_at();

create table if not exists public.parent_profiles (
  profile_id uuid primary key references public.profiles (id) on delete cascade,
  occupation text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger parent_profiles_set_updated_at
  before update on public.parent_profiles
  for each row execute function public.set_updated_at();

create table if not exists public.teacher_profiles (
  profile_id uuid primary key references public.profiles (id) on delete cascade,
  bio text,
  specialties text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger teacher_profiles_set_updated_at
  before update on public.teacher_profiles
  for each row execute function public.set_updated_at();

create table if not exists public.parent_student_links (
  id uuid primary key default gen_random_uuid(),
  parent_profile_id uuid not null references public.parent_profiles (profile_id) on delete cascade,
  student_profile_id uuid not null references public.student_profiles (profile_id) on delete cascade,
  relationship text not null default 'parent',
  status text not null default 'active' check (status in ('active', 'pending', 'revoked')),
  created_at timestamptz not null default now(),
  unique (parent_profile_id, student_profile_id)
);

create index if not exists parent_student_links_parent_idx on public.parent_student_links (parent_profile_id);
create index if not exists parent_student_links_student_idx on public.parent_student_links (student_profile_id);

-- Tạo profile rỗng khi một auth user mới được tạo (role mặc định "student",
-- Admin/API có thể cập nhật lại ngay sau đó). Giúp tránh trạng thái user tồn
-- tại trong auth.users nhưng không có profile ứng dụng.
create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, role, full_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'role', 'student'),
    coalesce(new.raw_user_meta_data ->> 'full_name', split_part(new.email, '@', 1))
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_auth_user();
