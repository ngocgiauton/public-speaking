-- Website và vận hành kinh doanh.

create table if not exists public.consultation_leads (
  id uuid primary key default gen_random_uuid(),
  student_full_name text not null,
  student_date_of_birth date,
  school text,
  english_level text,
  parent_full_name text not null,
  phone text not null,
  email text,
  learning_goal text,
  preferred_format text,
  preferred_schedule text,
  note text,
  status text not null default 'new' check (
    status in ('new', 'contacted', 'consulting', 'registered', 'not_suitable')
  ),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists consultation_leads_status_idx on public.consultation_leads (status, created_at desc);

create trigger consultation_leads_set_updated_at
  before update on public.consultation_leads
  for each row execute function public.set_updated_at();

create table if not exists public.site_settings (
  key text primary key,
  value jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create trigger site_settings_set_updated_at
  before update on public.site_settings
  for each row execute function public.set_updated_at();

create table if not exists public.faq_items (
  id uuid primary key default gen_random_uuid(),
  question text not null,
  answer text not null,
  order_index integer not null default 0,
  is_published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger faq_items_set_updated_at
  before update on public.faq_items
  for each row execute function public.set_updated_at();

create table if not exists public.testimonials (
  id uuid primary key default gen_random_uuid(),
  author_name text not null,
  author_role text,
  content text not null,
  is_placeholder boolean not null default true,
  is_published boolean not null default true,
  order_index integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger testimonials_set_updated_at
  before update on public.testimonials
  for each row execute function public.set_updated_at();
