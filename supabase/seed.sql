-- Seed dữ liệu nội dung (không phụ thuộc auth.users). Idempotent: có thể chạy
-- lại nhiều lần an toàn nhờ ON CONFLICT DO NOTHING / DO UPDATE.
--
-- Dữ liệu tài khoản demo (admin/teacher/parent/student) được tạo riêng bằng
-- `pnpm seed:demo` (scripts/seed-demo-users.ts) vì cần dùng Supabase Admin API
-- để tạo user trong auth.users một cách an toàn, không phụ thuộc phiên bản
-- schema nội bộ của GoTrue.

begin;

-- ---------------------------------------------------------------------------
-- Khóa học + 6 level học thuật
-- ---------------------------------------------------------------------------
insert into public.courses (id, slug, title, description, is_published)
values (
  '10000000-0000-0000-0000-000000000001',
  'public-speaking-dien-gia-nhi',
  'Public Speaking – Diễn Giả Nhí',
  'Lộ trình 22 buổi giúp học viên nhỏ tuổi xây dựng sự tự tin và kỹ năng thuyết trình qua 6 giai đoạn: Khởi động, Body Language, Tone of Voice, Content, Stage Skills và Final Speaker.',
  true
)
on conflict (id) do nothing;

insert into public.course_levels (id, course_id, order_index, slug, name, description)
values
  ('10000000-0000-0000-0000-000000000010', '10000000-0000-0000-0000-000000000001', 0, 'khoi-dong', 'Khởi động', 'Làm quen với tinh thần chia sẻ ý tưởng và thực hiện bài nói đầu vào.'),
  ('10000000-0000-0000-0000-000000000011', '10000000-0000-0000-0000-000000000001', 1, 'body-language', 'Body Language', 'Ngôn ngữ cơ thể: ánh mắt, tư thế, cử chỉ, di chuyển và sự tự nhiên trên sân khấu.'),
  ('10000000-0000-0000-0000-000000000012', '10000000-0000-0000-0000-000000000001', 2, 'tone-of-voice', 'Tone of Voice', 'Giọng nói: âm lượng, tốc độ, nhấn giọng, khoảng ngừng và cảm xúc.'),
  ('10000000-0000-0000-0000-000000000013', '10000000-0000-0000-0000-000000000001', 3, 'content', 'Content', 'Nội dung: tìm ý tưởng, cấu trúc bài nói, kể chuyện, mở và kết bài.'),
  ('10000000-0000-0000-0000-000000000014', '10000000-0000-0000-0000-000000000001', 4, 'stage-skills', 'Stage Skills', 'Kỹ năng sân khấu: chuẩn bị, kiểm soát hồi hộp, kết nối và xử lý tình huống.'),
  ('10000000-0000-0000-0000-000000000015', '10000000-0000-0000-0000-000000000001', 5, 'final-speaker', 'Final Speaker', 'Bài nói tổng kết và đánh giá tiến bộ toàn khóa.')
on conflict (id) do nothing;

-- ---------------------------------------------------------------------------
-- 22 bài học (buổi học)
-- ---------------------------------------------------------------------------
insert into public.lessons (
  id, course_level_id, slug, session_number, title, short_description,
  duration_minutes, objectives, key_takeaways, video_url,
  video_watch_threshold_percent, xp_reward, unlock_rules, is_published
) values
  ('10000000-0000-0000-0000-000000000101', '10000000-0000-0000-0000-000000000010', 'buoi-01-khai-mo', 1,
   'Khai mở: Ai cũng có một ý tưởng đáng chia sẻ', 'Làm quen với tinh thần chia sẻ ý tưởng và thực hiện bài nói đầu vào.',
   45,
   '["Hiểu tinh thần chia sẻ ý tưởng", "Xác định chủ đề bản thân muốn nói", "Thực hiện bài nói đầu vào 45-60 giây", "Lưu lại baseline để so sánh cuối khóa"]',
   '["Ai cũng có câu chuyện đáng kể", "Bài nói đầu vào là điểm mốc, không phải bài kiểm tra"]',
   'https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4', 80, 10, '{}', true),

  ('10000000-0000-0000-0000-000000000102', '10000000-0000-0000-0000-000000000011', 'buoi-02-anh-mat-nu-cuoi', 2,
   'Ánh mắt, nụ cười và sự hiện diện', 'Xây dựng sự hiện diện tự tin qua ánh mắt và nụ cười.',
   45,
   '["Duy trì ánh mắt với khán giả", "Sử dụng nụ cười tự nhiên", "Tạo sự hiện diện tự tin khi bắt đầu nói"]',
   '["Ánh mắt tạo kết nối trước khi lời nói bắt đầu", "Nụ cười tự nhiên giảm căng thẳng cho cả người nói và người nghe"]',
   'https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4', 80, 10, '{}', true),

  ('10000000-0000-0000-0000-000000000103', '10000000-0000-0000-0000-000000000011', 'buoi-03-tu-the-vung-vang', 3,
   'Tư thế vững vàng', 'Xây dựng tư thế đứng vững vàng, tự tin trên sân khấu.',
   45,
   '["Đứng vững với hai chân rộng bằng vai", "Giữ lưng thẳng, vai thả lỏng", "Tránh các thói quen tư thế gây mất tự tin"]',
   '["Tư thế vững vàng là nền tảng của sự tự tin", "Cơ thể thả lỏng giúp giọng nói tốt hơn"]',
   'https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4', 80, 10, '{}', true),

  ('10000000-0000-0000-0000-000000000104', '10000000-0000-0000-0000-000000000011', 'buoi-04-cu-chi-y-nghia', 4,
   'Cử chỉ có ý nghĩa', 'Sử dụng cử chỉ tay để nhấn mạnh và minh họa ý tưởng.',
   45,
   '["Dùng cử chỉ tay đúng lúc, đúng chỗ", "Tránh cử chỉ thừa gây mất tập trung", "Minh họa ý tưởng bằng hình ảnh cử chỉ"]',
   '["Cử chỉ nên phục vụ nội dung, không lấn át nội dung"]',
   'https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4', 80, 10, '{}', true),

  ('10000000-0000-0000-0000-000000000105', '10000000-0000-0000-0000-000000000011', 'buoi-05-anh-mat-bieu-cam', 5,
   'Ánh mắt và biểu cảm khuôn mặt', 'Kết hợp ánh mắt và biểu cảm khuôn mặt để truyền tải cảm xúc.',
   45,
   '["Biểu cảm khuôn mặt phù hợp với nội dung", "Luân phiên ánh mắt khắp khán phòng"]',
   '["Biểu cảm chân thật giúp câu chuyện đáng tin hơn"]',
   'https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4', 80, 10, '{}', true),

  ('10000000-0000-0000-0000-000000000106', '10000000-0000-0000-0000-000000000011', 'buoi-06-di-chuyen-chu-dich', 6,
   'Di chuyển có chủ đích', 'Di chuyển trên sân khấu để nhấn mạnh cấu trúc bài nói.',
   45,
   '["Di chuyển đánh dấu chuyển ý", "Tránh đi lại vô thức gây mất tập trung"]',
   '["Mỗi bước di chuyển nên có lý do"]',
   'https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4', 80, 10, '{}', true),

  ('10000000-0000-0000-0000-000000000107', '10000000-0000-0000-0000-000000000011', 'buoi-07-la-chinh-minh', 7,
   'Là chính mình trên sân khấu', 'Tổng hợp Body Language và thể hiện phong cách cá nhân.',
   45,
   '["Kết hợp ánh mắt, tư thế, cử chỉ một cách tự nhiên", "Thể hiện phong cách riêng"]',
   '["Kỹ thuật chỉ là công cụ — sự chân thật mới tạo kết nối lâu dài"]',
   'https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4', 80, 10, '{}', true),

  ('10000000-0000-0000-0000-000000000108', '10000000-0000-0000-0000-000000000012', 'buoi-08-phat-am-am-luong', 8,
   'Phát âm rõ và âm lượng phù hợp', 'Luyện phát âm rõ ràng và điều chỉnh âm lượng theo không gian.',
   45,
   '["Phát âm tròn vành rõ chữ", "Điều chỉnh âm lượng phù hợp với không gian"]',
   '["Nói rõ quan trọng hơn nói to"]',
   'https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4', 80, 10, '{}', true),

  ('10000000-0000-0000-0000-000000000109', '10000000-0000-0000-0000-000000000012', 'buoi-09-toc-do-khoang-ngung', 9,
   'Tốc độ nói và khoảng ngừng', 'Kiểm soát tốc độ nói và sử dụng khoảng ngừng hiệu quả.',
   45,
   '["Điều chỉnh tốc độ theo nội dung", "Dùng khoảng ngừng để nhấn mạnh"]',
   '["Khoảng ngừng là công cụ mạnh để thu hút sự chú ý"]',
   'https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4', 80, 10, '{}', true),

  ('10000000-0000-0000-0000-000000000110', '10000000-0000-0000-0000-000000000012', 'buoi-10-nhan-giong-tu-khoa', 10,
   'Nhấn giọng và từ khóa', 'Nhận diện và nhấn mạnh từ khóa quan trọng trong câu.',
   45,
   '["Xác định từ khóa cần nhấn trong câu", "Luyện nhấn giọng tự nhiên"]',
   '["Nhấn đúng từ khóa giúp người nghe nắm ý chính nhanh hơn"]',
   'https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4', 80, 10, '{}', true),

  ('10000000-0000-0000-0000-000000000111', '10000000-0000-0000-0000-000000000012', 'buoi-11-da-dang-am-sac', 11,
   'Đa dạng âm sắc và cảm xúc', 'Thay đổi âm sắc để truyền tải cảm xúc đa dạng.',
   45,
   '["Thay đổi âm sắc theo cảm xúc câu chuyện", "Tránh giọng đều đều"]',
   '["Giọng nói có cảm xúc giữ chân người nghe lâu hơn"]',
   'https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4', 80, 10, '{}', true),

  ('10000000-0000-0000-0000-000000000112', '10000000-0000-0000-0000-000000000012', 'buoi-12-luyen-giong-tong-hop', 12,
   'Luyện giọng tổng hợp', 'Kết hợp toàn bộ kỹ năng Tone of Voice trong một bài nói.',
   45,
   '["Kết hợp âm lượng, tốc độ, nhấn giọng, âm sắc"]',
   '["Giọng nói tốt là sự phối hợp nhiều yếu tố, không phải một kỹ thuật đơn lẻ"]',
   'https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4', 80, 10, '{}', true),

  ('10000000-0000-0000-0000-000000000113', '10000000-0000-0000-0000-000000000013', 'buoi-13-tim-y-tuong-throughline', 13,
   'Tìm ý tưởng và Throughline', 'Xác định ý tưởng trung tâm (throughline) cho bài nói.',
   45,
   '["Xác định một ý tưởng trung tâm rõ ràng", "Loại bỏ nội dung không phục vụ ý tưởng chính"]',
   '["Một bài nói hay chỉ nên có một throughline"]',
   'https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4', 80, 10, '{}', true),

  ('10000000-0000-0000-0000-000000000114', '10000000-0000-0000-0000-000000000013', 'buoi-14-cau-truc-bai-noi', 14,
   'Xây dựng cấu trúc bài nói', 'Xây dựng mở bài - thân bài - kết bài mạch lạc.',
   45,
   '["Xây dựng dàn ý ba phần rõ ràng", "Sắp xếp ý theo trình tự logic"]',
   '["Cấu trúc rõ ràng giúp người nghe dễ theo dõi"]',
   'https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4', 80, 10, '{}', true),

  ('10000000-0000-0000-0000-000000000115', '10000000-0000-0000-0000-000000000013', 'buoi-15-ke-chuyen-storytelling', 15,
   'Kể chuyện – Storytelling', 'Sử dụng kỹ thuật kể chuyện để minh họa ý tưởng.',
   45,
   '["Xây dựng câu chuyện có mở đầu - cao trào - kết thúc", "Kết nối câu chuyện với thông điệp chính"]',
   '["Câu chuyện tốt khiến ý tưởng trừu tượng trở nên dễ nhớ"]',
   'https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4', 80, 10, '{}', true),

  ('10000000-0000-0000-0000-000000000116', '10000000-0000-0000-0000-000000000013', 'buoi-16-mo-bai-hap-dan', 16,
   'Mở bài hấp dẫn', 'Xây dựng phần mở bài thu hút sự chú ý ngay từ đầu.',
   45,
   '["Thiết kế câu mở đầu gây chú ý", "Giới thiệu throughline ngay trong mở bài"]',
   '["30 giây đầu tiên quyết định sự chú ý của khán giả"]',
   'https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4', 80, 10, '{}', true),

  ('10000000-0000-0000-0000-000000000117', '10000000-0000-0000-0000-000000000013', 'buoi-17-ket-bai-dang-nho', 17,
   'Kết bài đáng nhớ', 'Xây dựng phần kết bài để lại ấn tượng lâu dài.',
   45,
   '["Tóm tắt thông điệp chính", "Kết bài bằng lời kêu gọi hành động hoặc hình ảnh đáng nhớ"]',
   '["Kết bài là phần khán giả nhớ lâu nhất"]',
   'https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4', 80, 10, '{}', true),

  ('10000000-0000-0000-0000-000000000118', '10000000-0000-0000-0000-000000000014', 'buoi-18-chuan-bi-san-khau', 18,
   'Chuẩn bị bài nói và sân khấu', 'Chuẩn bị nội dung, tâm lý và không gian trước khi lên sân khấu.',
   45,
   '["Lập checklist chuẩn bị trước buổi nói", "Làm quen với không gian sân khấu"]',
   '["Chuẩn bị kỹ giúp giảm hồi hộp đáng kể"]',
   'https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4', 80, 10, '{}', true),

  ('10000000-0000-0000-0000-000000000119', '10000000-0000-0000-0000-000000000014', 'buoi-19-kiem-soat-hoi-hop', 19,
   'Kiểm soát hồi hộp', 'Kỹ thuật quản lý cảm xúc hồi hộp trước và trong khi nói.',
   45,
   '["Nhận diện dấu hiệu hồi hộp của bản thân", "Áp dụng kỹ thuật hít thở và thư giãn"]',
   '["Hồi hộp là bình thường — quan trọng là cách kiểm soát nó"]',
   'https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4', 80, 10, '{}', true),

  ('10000000-0000-0000-0000-000000000120', '10000000-0000-0000-0000-000000000014', 'buoi-20-ket-noi-tuong-tac', 20,
   'Kết nối và tương tác với khán giả', 'Kỹ thuật đặt câu hỏi và tương tác với khán giả.',
   45,
   '["Đặt câu hỏi tương tác với khán giả", "Đọc phản ứng khán giả để điều chỉnh"]',
   '["Bài nói hay là một cuộc đối thoại, không phải độc thoại"]',
   'https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4', 80, 10, '{}', true),

  ('10000000-0000-0000-0000-000000000121', '10000000-0000-0000-0000-000000000014', 'buoi-21-xu-ly-tinh-huong', 21,
   'Xử lý tình huống trên sân khấu', 'Cách xử lý các tình huống bất ngờ khi thuyết trình.',
   45,
   '["Xử lý quên lời một cách tự nhiên", "Giữ bình tĩnh khi có sự cố kỹ thuật"]',
   '["Người nói giỏi không phải người không mắc lỗi, mà là người xử lý lỗi mượt mà"]',
   'https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4', 80, 10, '{}', true),

  ('10000000-0000-0000-0000-000000000122', '10000000-0000-0000-0000-000000000015', 'buoi-22-bai-noi-tong-ket', 22,
   'Bài nói tổng kết và đánh giá tiến bộ', 'Trình bày bài nói tổng kết toàn khóa và nhìn lại hành trình tiến bộ.',
   60,
   '["Trình bày bài nói hoàn chỉnh 3-5 phút", "So sánh với bài nói đầu vào ở buổi 1"]',
   '["Tiến bộ được đo bằng hành trình, không chỉ một bài nói"]',
   'https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4', 80, 10, '{}', true)
on conflict (id) do nothing;

-- Điều kiện tiên quyết: mỗi bài yêu cầu bài liền trước trong cùng khóa học.
insert into public.lesson_prerequisites (lesson_id, prerequisite_lesson_id)
select l.id, prev.id
from public.lessons l
join public.lessons prev on prev.session_number = l.session_number - 1
where l.session_number between 2 and 22
on conflict do nothing;

-- Kiến thức cốt lõi mẫu cho buổi 2.
insert into public.lesson_sections (lesson_id, title, body, example_correct, example_incorrect, memory_tip, common_mistake, order_index)
values (
  '10000000-0000-0000-0000-000000000102',
  'Ánh mắt tạo kết nối',
  'Ánh mắt là công cụ đầu tiên để tạo kết nối với người nghe, ngay cả trước khi bạn nói câu đầu tiên. Hãy luân phiên nhìn vào các khu vực khác nhau của khán phòng thay vì chỉ nhìn xuống sàn hoặc lên trần nhà.',
  'Nhìn vào một người trong khoảng 3-5 giây trước khi chuyển ánh mắt sang người khác.',
  'Nhìn chằm chằm vào một điểm cố định trên tường suốt bài nói.',
  'Hãy tưởng tượng khán phòng chia thành ba khu vực và lần lượt "ghé thăm" từng khu vực bằng ánh mắt.',
  'Nhìn xuống giấy ghi chú quá lâu khiến mất kết nối với khán giả.',
  1
)
on conflict do nothing;

-- ---------------------------------------------------------------------------
-- Quiz mẫu cho buổi 2
-- ---------------------------------------------------------------------------
insert into public.quizzes (id, lesson_id, title, instructions, pass_score, max_attempts, is_published)
values (
  '10000000-0000-0000-0000-000000000201',
  '10000000-0000-0000-0000-000000000102',
  'Kiểm tra nhanh: Ánh mắt, nụ cười và sự hiện diện',
  'Chọn đáp án đúng nhất cho mỗi câu hỏi. Bạn cần đạt tối thiểu 70 điểm để hoàn thành quiz.',
  70, null, true
)
on conflict (id) do nothing;

insert into public.quiz_questions (id, quiz_id, question_text, question_type, explanation, points, order_index)
values
  ('10000000-0000-0000-0000-000000000211', '10000000-0000-0000-0000-000000000201',
   'Khi nói trước đám đông, ánh mắt nên được sử dụng như thế nào?',
   'single_choice', 'Luân phiên ánh mắt khắp khán phòng giúp tạo cảm giác kết nối với nhiều người nghe.', 25, 1),
  ('10000000-0000-0000-0000-000000000212', '10000000-0000-0000-0000-000000000201',
   'Những lợi ích nào sau đây đến từ một nụ cười tự nhiên khi thuyết trình? (Chọn tất cả đáp án đúng)',
   'multiple_choice', 'Nụ cười tự nhiên giúp giảm căng thẳng, tạo thiện cảm và khiến người nói tự tin hơn.', 25, 2),
  ('10000000-0000-0000-0000-000000000213', '10000000-0000-0000-0000-000000000201',
   'Đúng hay Sai: Nên nhìn chằm chằm vào một điểm cố định suốt bài nói để tránh mất tập trung.',
   'true_false', 'Sai — nhìn cố định một điểm khiến mất kết nối với khán giả; nên luân phiên ánh mắt.', 25, 3),
  ('10000000-0000-0000-0000-000000000214', '10000000-0000-0000-0000-000000000201',
   'Sắp xếp thứ tự hợp lý khi bắt đầu một bài nói.',
   'ordering', 'Hít thở sâu → Mỉm cười → Nhìn khán giả → Bắt đầu nói.', 25, 4)
on conflict (id) do nothing;

insert into public.quiz_options (id, question_id, option_text, is_correct, order_index)
values
  ('10000000-0000-0000-0000-000000000221', '10000000-0000-0000-0000-000000000211', 'Luân phiên nhìn khắp các khu vực khán phòng', true, 1),
  ('10000000-0000-0000-0000-000000000222', '10000000-0000-0000-0000-000000000211', 'Chỉ nhìn xuống sàn nhà', false, 2),
  ('10000000-0000-0000-0000-000000000223', '10000000-0000-0000-0000-000000000211', 'Nhìn chằm chằm vào một người duy nhất', false, 3),

  ('10000000-0000-0000-0000-000000000224', '10000000-0000-0000-0000-000000000212', 'Giảm căng thẳng cho người nói', true, 1),
  ('10000000-0000-0000-0000-000000000225', '10000000-0000-0000-0000-000000000212', 'Tạo thiện cảm với người nghe', true, 2),
  ('10000000-0000-0000-0000-000000000226', '10000000-0000-0000-0000-000000000212', 'Làm bài nói dài hơn', false, 3),

  ('10000000-0000-0000-0000-000000000227', '10000000-0000-0000-0000-000000000213', 'Đúng', false, 1),
  ('10000000-0000-0000-0000-000000000228', '10000000-0000-0000-0000-000000000213', 'Sai', true, 2),

  ('10000000-0000-0000-0000-000000000229', '10000000-0000-0000-0000-000000000214', 'Hít thở sâu', false, 1),
  ('10000000-0000-0000-0000-000000000230', '10000000-0000-0000-0000-000000000214', 'Mỉm cười', false, 2),
  ('10000000-0000-0000-0000-000000000231', '10000000-0000-0000-0000-000000000214', 'Nhìn khán giả', false, 3),
  ('10000000-0000-0000-0000-000000000232', '10000000-0000-0000-0000-000000000214', 'Bắt đầu nói', false, 4)
on conflict (id) do nothing;

-- ---------------------------------------------------------------------------
-- Bài tập chính mẫu cho buổi 2 + rubric áp dụng
-- ---------------------------------------------------------------------------
insert into public.assignments (
  id, lesson_id, title, description, instructions, assignment_type,
  allowed_media, max_video_mb, max_audio_mb, due_offset_days, min_pass_score,
  xp_reward, is_published
) values (
  '10000000-0000-0000-0000-000000000301',
  '10000000-0000-0000-0000-000000000102',
  'Ghi hình phần tự giới thiệu 60 giây',
  'Quay một video tự giới thiệu bản thân trong 60 giây, tập trung thể hiện ánh mắt kết nối và tư thế vững vàng.',
  'Đứng trước camera, đảm bảo đủ ánh sáng. Nhìn vào camera như đang nhìn khán giả. Giới thiệu tên, sở thích và một điều bạn tự hào về bản thân.',
  'main', '["video"]'::jsonb, 200, 50, 7, 70, 50, true
)
on conflict (id) do nothing;

insert into public.assignment_rubric_criteria (assignment_id, criterion_key, group_key, label, max_score, order_index)
values
  ('10000000-0000-0000-0000-000000000301', 'eye_contact', 'body_language', 'Ánh mắt', 5, 1),
  ('10000000-0000-0000-0000-000000000301', 'posture', 'body_language', 'Tư thế', 5, 2),
  ('10000000-0000-0000-0000-000000000301', 'confidence', 'confidence_connection', 'Sự tự tin', 5, 3),
  ('10000000-0000-0000-0000-000000000301', 'connection', 'confidence_connection', 'Khả năng kết nối', 5, 4)
on conflict (assignment_id, criterion_key) do nothing;

-- ---------------------------------------------------------------------------
-- 12 huy hiệu mẫu
-- ---------------------------------------------------------------------------
insert into public.badges (id, slug, name, description, icon, criteria_type, criteria_value, rarity, is_active)
values
  ('10000000-0000-0000-0000-000000000401', 'first-speech', 'First Speech', 'Hoàn thành bài nói đầu tiên của khóa học.', 'mic', 'lesson_complete', '{"sessionNumber": 1}', 'common', true),
  ('10000000-0000-0000-0000-000000000402', 'eye-contact-starter', 'Eye Contact Starter', 'Bắt đầu thành thạo kỹ năng giao tiếp bằng ánh mắt.', 'eye', 'skill_score', '{"skill": "eye_contact", "minScore": 4}', 'common', true),
  ('10000000-0000-0000-0000-000000000403', 'confident-posture', 'Confident Posture', 'Duy trì tư thế vững vàng, tự tin.', 'move', 'skill_score', '{"skill": "posture", "minScore": 4}', 'common', true),
  ('10000000-0000-0000-0000-000000000404', 'great-smile', 'Great Smile', 'Thể hiện nụ cười tự nhiên khi thuyết trình.', 'smile', 'skill_score', '{"skill": "emotion", "minScore": 4}', 'common', true),
  ('10000000-0000-0000-0000-000000000405', 'gesture-master', 'Gesture Master', 'Sử dụng cử chỉ tay hiệu quả và có chủ đích.', 'hand', 'skill_score', '{"skill": "gesture", "minScore": 4}', 'rare', true),
  ('10000000-0000-0000-0000-000000000406', 'voice-controller', 'Voice Controller', 'Kiểm soát tốt âm lượng và tốc độ giọng nói.', 'volume-2', 'skill_score', '{"skill": "volume", "minScore": 4}', 'rare', true),
  ('10000000-0000-0000-0000-000000000407', 'pause-expert', 'Pause Expert', 'Sử dụng khoảng ngừng hiệu quả để nhấn mạnh ý.', 'pause', 'skill_score', '{"skill": "pause", "minScore": 4}', 'rare', true),
  ('10000000-0000-0000-0000-000000000408', 'story-builder', 'Story Builder', 'Xây dựng câu chuyện thuyết phục và mạch lạc.', 'book-open', 'skill_score', '{"skill": "storytelling", "minScore": 4}', 'rare', true),
  ('10000000-0000-0000-0000-000000000409', 'stage-explorer', 'Stage Explorer', 'Di chuyển và làm chủ không gian sân khấu.', 'footprints', 'skill_score', '{"skill": "stage_command", "minScore": 4}', 'epic', true),
  ('10000000-0000-0000-0000-000000000410', 'confident-speaker', 'Confident Speaker', 'Đạt tổng điểm rubric từ 85 trở lên trong một bài nói.', 'star', 'assignment_approved', '{"minScore": 85}', 'epic', true),
  ('10000000-0000-0000-0000-000000000411', 'royal-speaker', 'Royal Speaker', 'Đạt rank Royal Speaker.', 'crown', 'total_xp', '{"minXp": 2200}', 'legendary', true),
  ('10000000-0000-0000-0000-000000000412', 'speak-to-lead', 'Speak to Lead', 'Hoàn thành toàn bộ 22 buổi học của khóa học.', 'trophy', 'lesson_complete', '{"sessionNumber": 22}', 'legendary', true)
on conflict (id) do nothing;

-- ---------------------------------------------------------------------------
-- Nội dung website: FAQ, testimonial placeholder, site settings
-- ---------------------------------------------------------------------------
insert into public.faq_items (question, answer, order_index, is_published)
values
  ('Chương trình phù hợp với độ tuổi nào?', 'Thông tin độ tuổi khuyến nghị cụ thể sẽ được Royal Public Speaking Club cập nhật tại đây. Vui lòng đăng ký tư vấn để được hỗ trợ chi tiết theo từng học viên.', 1, true),
  ('Học viên chưa tự tin có thể tham gia không?', 'Chương trình được thiết kế theo lộ trình từ cơ bản, phù hợp với học viên chưa có kinh nghiệm nói trước đám đông.', 2, true),
  ('Học viên cần trình độ tiếng Anh như thế nào?', 'Chương trình giảng dạy bằng tiếng Việt là chính, có sử dụng song ngữ cho một số thuật ngữ chuyên môn.', 3, true),
  ('Mỗi buổi học kéo dài bao lâu?', 'Thời lượng từng buổi học sẽ được Royal Public Speaking Club công bố và cập nhật tại đây.', 4, true),
  ('Phụ huynh theo dõi tiến độ bằng cách nào?', 'Phụ huynh có khu vực riêng trên nền tảng để xem tiến độ học, điểm kỹ năng, bài đã nộp và phản hồi của giáo viên.', 5, true),
  ('Bài tập video được chấm như thế nào?', 'Giáo viên chấm bài theo rubric 5 nhóm kỹ năng và gửi phản hồi chi tiết cho từng bài nộp.', 6, true),
  ('Khi nào học viên được lên level?', 'Học viên lên level học thuật khi hoàn thành các điều kiện của bài học. Rank thành tích tăng theo tổng XP tích lũy.', 7, true),
  ('Chương trình có chứng nhận không?', 'Nền tảng có hệ thống chứng nhận cho học viên hoàn thành khóa học. Điều kiện cấp chứng nhận cụ thể sẽ được cập nhật tại đây.', 8, true)
on conflict do nothing;

insert into public.testimonials (author_name, author_role, content, is_placeholder, is_published, order_index)
values
  ('Phụ huynh học viên (minh họa)', 'Phụ huynh', 'Nội dung minh họa – cần thay bằng phản hồi thực tế.', true, true, 1),
  ('Học viên (minh họa)', 'Học viên', 'Nội dung minh họa – cần thay bằng phản hồi thực tế.', true, true, 2),
  ('Phụ huynh học viên (minh họa)', 'Phụ huynh', 'Nội dung minh họa – cần thay bằng phản hồi thực tế.', true, true, 3)
on conflict do nothing;

insert into public.site_settings (key, value)
values
  ('director_bio', '{"status": "placeholder", "note": "Tiểu sử chi tiết của chủ nhiệm chương trình sẽ được cập nhật tại đây."}'),
  ('age_range', '{"status": "placeholder", "note": "Độ tuổi khuyến nghị sẽ được cập nhật tại đây."}'),
  ('tuition_note', '{"status": "placeholder", "note": "Thông tin học phí sẽ được cập nhật tại đây."}'),
  ('contact_info', '{"status": "placeholder", "note": "Thông tin liên hệ chính thức sẽ được cập nhật tại đây."}')
on conflict (key) do nothing;

-- ---------------------------------------------------------------------------
-- 2 lớp học mẫu (giáo viên/học viên được gán trong scripts/seed-demo-users.ts)
-- ---------------------------------------------------------------------------
insert into public.classes (id, course_id, name, status, start_date)
values
  ('10000000-0000-0000-0000-000000000501', '10000000-0000-0000-0000-000000000001', 'Lớp Diễn Giả Nhí – Sáng Thứ Bảy', 'active', '2026-06-01'),
  ('10000000-0000-0000-0000-000000000502', '10000000-0000-0000-0000-000000000001', 'Lớp Diễn Giả Nhí – Chiều Chủ Nhật', 'active', '2026-06-02')
on conflict (id) do nothing;

commit;
