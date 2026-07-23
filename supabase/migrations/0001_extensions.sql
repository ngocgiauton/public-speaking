-- Bật các extension cần thiết.
create extension if not exists "pgcrypto" with schema extensions;

-- Hàm dùng chung để tự động cập nhật cột updated_at.
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;
