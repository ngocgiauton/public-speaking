-- Hàm trợ giúp cho Row Level Security. Dùng `security definer` để đọc bảng
-- profiles/liên kết mà không gây đệ quy chính sách (policy) hoặc cần cấp
-- quyền SELECT trực tiếp cho mọi vai trò trên các bảng liên kết.

create or replace function public.current_role()
returns text
language sql
security definer
stable
set search_path = public
as $$
  select role from public.profiles where id = auth.uid();
$$;

create or replace function public.is_admin()
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin' and status = 'active'
  );
$$;

create or replace function public.is_teacher_of_class(target_class_id uuid)
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1 from public.class_teachers
    where class_id = target_class_id and teacher_profile_id = auth.uid()
  );
$$;

create or replace function public.is_teacher_of_student(target_student_id uuid)
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1
    from public.class_enrollments ce
    join public.class_teachers ct on ct.class_id = ce.class_id
    where ce.student_profile_id = target_student_id
      and ct.teacher_profile_id = auth.uid()
  );
$$;

create or replace function public.is_parent_of_student(target_student_id uuid)
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1 from public.parent_student_links
    where student_profile_id = target_student_id
      and parent_profile_id = auth.uid()
      and status = 'active'
  );
$$;
