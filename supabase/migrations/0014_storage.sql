-- Supabase Storage buckets và policy.
--
-- Quy ước đường dẫn (path) trong mỗi bucket — bắt buộc để RLS có thể kiểm tra
-- quyền sở hữu chỉ dựa trên tên file, không cần tin dữ liệu client:
--   avatars/{profile_id}/{filename}
--   lesson-media/{lesson_id}/{filename}
--   submission-media/{student_profile_id}/{submission_id}/{filename}
--   certificate-files/{student_profile_id}/{filename}

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('avatars', 'avatars', true, 5242880, array['image/png', 'image/jpeg', 'image/webp']),
  ('lesson-media', 'lesson-media', false, 524288000, array['video/mp4', 'video/webm', 'image/png', 'image/jpeg', 'application/pdf']),
  ('submission-media', 'submission-media', false, 524288000, array['video/mp4', 'video/webm', 'video/quicktime', 'audio/mpeg', 'audio/mp4', 'audio/webm']),
  ('certificate-files', 'certificate-files', false, 10485760, array['application/pdf'])
on conflict (id) do nothing;

-- avatars: đọc công khai (bucket public), chỉ chủ sở hữu (thư mục đầu tiên =
-- profile_id của chính mình) mới được ghi/xóa.
create policy "avatars_insert_own_folder" on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "avatars_update_own_folder" on storage.objects
  for update to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text)
  with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "avatars_delete_own_folder" on storage.objects
  for delete to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

-- lesson-media: chỉ người dùng đã đăng nhập mới đọc được (bucket private +
-- signed URL do server cấp); chỉ admin ghi.
create policy "lesson_media_read_authenticated" on storage.objects
  for select to authenticated
  using (bucket_id = 'lesson-media');

create policy "lesson_media_admin_write" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'lesson-media' and public.is_admin());

create policy "lesson_media_admin_update" on storage.objects
  for update to authenticated
  using (bucket_id = 'lesson-media' and public.is_admin())
  with check (bucket_id = 'lesson-media' and public.is_admin());

create policy "lesson_media_admin_delete" on storage.objects
  for delete to authenticated
  using (bucket_id = 'lesson-media' and public.is_admin());

-- submission-media: private tuyệt đối. Học viên chỉ ghi vào thư mục của
-- chính mình; học viên và giáo viên phụ trách được đọc qua signed URL.
create policy "submission_media_insert_own" on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'submission-media'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "submission_media_select_owner_or_teacher" on storage.objects
  for select to authenticated
  using (
    bucket_id = 'submission-media'
    and (
      (storage.foldername(name))[1] = auth.uid()::text
      or public.is_admin()
      or public.is_teacher_of_student(((storage.foldername(name))[1])::uuid)
      or public.is_parent_of_student(((storage.foldername(name))[1])::uuid)
    )
  );

create policy "submission_media_delete_own" on storage.objects
  for delete to authenticated
  using (
    bucket_id = 'submission-media'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- certificate-files: chỉ đọc qua signed URL, chỉ admin/service role ghi.
create policy "certificate_files_select_owner" on storage.objects
  for select to authenticated
  using (
    bucket_id = 'certificate-files'
    and (
      (storage.foldername(name))[1] = auth.uid()::text
      or public.is_admin()
      or public.is_parent_of_student(((storage.foldername(name))[1])::uuid)
    )
  );

create policy "certificate_files_admin_write" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'certificate-files' and public.is_admin());
