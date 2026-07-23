-- Điểm kinh nghiệm (XP), rank thành tích, huy hiệu.

-- Nhật ký mọi thay đổi XP — nguồn sự thật duy nhất. total_xp trong
-- student_profiles chỉ là cache được cập nhật bởi trigger bên dưới.
create table if not exists public.xp_transactions (
  id uuid primary key default gen_random_uuid(),
  student_profile_id uuid not null references public.student_profiles (profile_id) on delete cascade,
  amount integer not null,
  reason_code text not null,
  reference_type text check (reference_type in ('lesson', 'quiz', 'assignment', 'submission', 'streak', 'manual')),
  reference_id uuid,
  note text,
  created_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists xp_transactions_student_idx on public.xp_transactions (student_profile_id, created_at desc);

create or replace function public.apply_xp_transaction()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  update public.student_profiles
  set total_xp = total_xp + new.amount
  where profile_id = new.student_profile_id;
  return new;
end;
$$;

drop trigger if exists xp_transactions_apply on public.xp_transactions;
create trigger xp_transactions_apply
  after insert on public.xp_transactions
  for each row execute function public.apply_xp_transaction();

-- Cache rank thành tích hiện tại (ngưỡng XP được định nghĩa trong code:
-- src/config/gamification.ts) để truy vấn nhanh không cần tính lại mỗi lần.
create table if not exists public.student_ranks (
  student_profile_id uuid primary key references public.student_profiles (profile_id) on delete cascade,
  rank_slug text not null default 'beginner-speaker',
  achieved_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger student_ranks_set_updated_at
  before update on public.student_ranks
  for each row execute function public.set_updated_at();

create table if not exists public.badges (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  description text,
  icon text not null default 'award',
  criteria_type text not null check (
    criteria_type in (
      'lesson_complete', 'quiz_score', 'assignment_approved', 'streak',
      'total_xp', 'skill_score', 'manual'
    )
  ),
  criteria_value jsonb not null default '{}'::jsonb,
  rarity text not null default 'common' check (rarity in ('common', 'rare', 'epic', 'legendary')),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger badges_set_updated_at
  before update on public.badges
  for each row execute function public.set_updated_at();

create table if not exists public.student_badges (
  id uuid primary key default gen_random_uuid(),
  student_profile_id uuid not null references public.student_profiles (profile_id) on delete cascade,
  badge_id uuid not null references public.badges (id) on delete cascade,
  awarded_at timestamptz not null default now(),
  awarded_by uuid references public.profiles (id) on delete set null,
  unique (student_profile_id, badge_id)
);

create index if not exists student_badges_student_idx on public.student_badges (student_profile_id);
