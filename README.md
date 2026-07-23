# Public Speaking – Diễn Giả Nhí

Nền tảng học tập và luyện tập kỹ năng thuyết trình dành cho trẻ em và thiếu
niên, do **Royal Public Speaking Club** tổ chức. Slogan: **Speak to Lead**.

Học viên không chỉ xem video mà thực hành, nộp bài, nhận phản hồi, tích lũy
XP, mở khóa bài học và lên cấp độ — kết hợp giữa nền tảng học trực tuyến,
trò chơi giáo dục và công cụ theo dõi tiến bộ cho phụ huynh, giáo viên và
quản trị viên.

> Đây là một MVP có thể chạy thực tế, không phải mockup. Xem mục
> [Giới hạn của MVP](#giới-hạn-của-mvp) để biết trung thực những gì chưa
> hoàn thiện.

## Mục lục

- [Chức năng](#chức-năng)
- [Tech stack](#tech-stack)
- [Cấu trúc dự án](#cấu-trúc-dự-án)
- [Yêu cầu hệ thống](#yêu-cầu-hệ-thống)
- [Cài đặt local](#cài-đặt-local)
- [Tạo Supabase project](#tạo-supabase-project)
- [Chạy migrations và seed](#chạy-migrations-và-seed)
- [Cấu hình environment variables](#cấu-hình-environment-variables)
- [Chạy development](#chạy-development)
- [Lint, typecheck, test, build](#lint-typecheck-test-build)
- [Triển khai Vercel](#triển-khai-vercel)
- [Tạo tài khoản admin đầu tiên](#tạo-tài-khoản-admin-đầu-tiên)
- [Tùy chỉnh logo, màu và nội dung](#tùy-chỉnh-logo-màu-và-nội-dung)
- [Giới hạn của MVP](#giới-hạn-của-mvp)
- [Roadmap](#roadmap)

## Chức năng

- **5 vai trò**: Guest, Học viên, Phụ huynh, Giáo viên, Quản trị viên — phân
  quyền RBAC ở cả tầng ứng dụng lẫn Row Level Security.
- **Trang công khai**: trang chủ, giới thiệu, chương trình, lộ trình 22
  buổi, giảng viên, FAQ, đăng ký tư vấn, đăng nhập/quên mật khẩu.
- **Học viên**: dashboard, lộ trình học trực quan (My Journey), bài học
  (video + kiến thức + quiz + bài tập), tải video bài tập, lưu nháp, nộp
  bài, xem kết quả/phản hồi, XP, rank, huy hiệu, chứng nhận, phòng luyện
  tập theo kỹ năng, thông báo, hồ sơ.
- **Phụ huynh**: chọn học viên (hỗ trợ nhiều con), xem tiến độ, điểm kỹ
  năng, XP/rank, biểu đồ tiến bộ, bài đã nộp, phản hồi giáo viên, báo cáo,
  thông báo — chỉ xem, không sửa được điểm/bài của học viên.
- **Giáo viên**: dashboard lớp học, hàng chờ chấm bài, chấm điểm theo rubric
  5 nhóm kỹ năng, viết nhận xét, duyệt/yêu cầu làm lại, cộng XP thưởng có
  giới hạn, gửi thông báo/giao bài cho lớp, báo cáo lớp.
- **Quản trị viên**: dashboard tổng hợp, CRUD người dùng (tạo tài khoản, gán
  vai trò, khóa/mở khóa), học viên, phụ huynh (liên kết phụ huynh–học
  viên), giáo viên, lớp học, khóa học, level, bài học, quiz (kèm câu hỏi),
  bài tập (kèm chọn tiêu chí rubric), rubric tham chiếu, huy hiệu, chứng
  nhận, quản lý lead đăng ký tư vấn, nội dung website (FAQ/testimonial/cài
  đặt), báo cáo tổng hợp.
- **Game hóa**: XP theo nhật ký giao dịch (`xp_transactions`, không chỉ một
  con số tổng), rank thành tích tách biệt với level học thuật, 12 huy hiệu
  mẫu, chuỗi ngày học (streak).
- **AI Speech Coach**: kiến trúc mở rộng (`SpeechAnalysisProvider`), feature
  flag, trang "Sắp ra mắt" — **chưa** tích hợp AI thật (xem giới hạn MVP).

## Tech stack

- **Next.js 16** (App Router, TypeScript strict, Turbopack), React 19.
- **Tailwind CSS v4** (cấu hình theme qua `@theme` trong `globals.css`) +
  hệ thống component tự viết theo triết lý shadcn/ui (`class-variance-authority`
  + `tailwind-merge`), `lucide-react` cho icon, `recharts` cho biểu đồ.
- **Supabase**: PostgreSQL, Authentication (email/password), Row Level
  Security, Storage.
- **Zod** cho validation; các form phức tạp dùng Server Actions +
  `useActionState` (React 19) thay vì React Hook Form — đủ đáp ứng yêu cầu
  validate/hiển thị lỗi/disable khi submit mà không cần thêm thư viện.
- **Vitest** cho unit test (logic gamification/RBAC/validation thuần),
  **Playwright** cho end-to-end test.
- **pnpm** làm package manager.

## Cấu trúc dự án

```
src/
  app/            # Routes (App Router): (public), (auth), student, parent, teacher, admin, api
  components/     # ui, layout, public, learning, gamification, dashboard, forms, charts, shared, admin
  features/       # Logic nghiệp vụ theo domain: auth, courses, lessons, quizzes, assignments,
                  # submissions, reviews, progress, xp, badges, notifications, gamification, admin/*
  lib/            # supabase (client/server/admin), auth, storage, data (data access layer), utils
  types/          # database.ts (kiểu dữ liệu khớp schema)
  config/         # site.ts, nav.ts, env.ts, gamification.ts, practice.ts
  hooks/, styles/
supabase/
  migrations/     # SQL migration theo thứ tự 0001 -> 0014
  seed.sql        # Dữ liệu mẫu (khóa học, 22 bài học, quiz, assignment, badge, FAQ...)
scripts/
  seed-demo-users.ts  # Tạo tài khoản demo qua Supabase Admin API
tests/
  unit/           # Vitest — logic thuần (XP, rank, unlock, rubric, state machine, zod schema)
  e2e/            # Playwright — luồng Guest (không cần backend) + Student/Teacher/Parent/Admin (cần seed)
docs/
  IMPLEMENTATION_PLAN.md, RLS.md
```

## Yêu cầu hệ thống

- Node.js 20+ (khuyến nghị 22).
- pnpm 9+ (`corepack enable` nếu chưa có).
- Một project Supabase (miễn phí đủ dùng cho development).

## Cài đặt local

```bash
pnpm install
cp .env.example .env.local
# điền NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY
```

## Tạo Supabase project

1. Tạo project mới tại [supabase.com](https://supabase.com).
2. Vào **Project Settings > API**, lấy `Project URL` (→
   `NEXT_PUBLIC_SUPABASE_URL`), `anon public key` (→
   `NEXT_PUBLIC_SUPABASE_ANON_KEY`) và `service_role key` (→
   `SUPABASE_SERVICE_ROLE_KEY`).
3. Vào **Authentication > URL Configuration**, thêm:
   - Site URL: `http://localhost:3000` (dev) và domain production sau này.
   - Redirect URLs: `http://localhost:3000/**` và domain production
     tương ứng (cần cho luồng đặt lại mật khẩu).

## Chạy migrations và seed

Cách 1 — dùng [Supabase CLI](https://supabase.com/docs/guides/cli):

```bash
supabase login
supabase link --project-ref <project-ref>
supabase db push                 # chạy toàn bộ file trong supabase/migrations
psql "$(supabase db url)" -f supabase/seed.sql   # hoặc dán nội dung seed.sql vào SQL Editor
```

Cách 2 — dùng **SQL Editor** trên Supabase Dashboard: dán nội dung từng file
trong `supabase/migrations/` theo đúng thứ tự số (0001 → 0014), sau đó dán
`supabase/seed.sql`.

Sau khi seed nội dung, tạo **tài khoản demo** (admin, giáo viên, phụ huynh,
học viên) bằng script — script này dùng Supabase Admin API nên an toàn với
mọi phiên bản GoTrue và không commit mật khẩu vào repository:

```bash
pnpm seed:demo
```

Mật khẩu được sinh ngẫu nhiên và in ra terminal + ghi vào
`scripts/.demo-credentials.json` (đã có trong `.gitignore`, không commit).

## Cấu hình environment variables

Xem `.env.example` để biết đầy đủ danh sách. Tóm tắt:

| Biến | Bắt buộc | Ghi chú |
|---|---|---|
| `NEXT_PUBLIC_APP_URL` | Không | Mặc định `http://localhost:3000` |
| `NEXT_PUBLIC_SUPABASE_URL` | Có | Từ Supabase Project Settings |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Có | Từ Supabase Project Settings |
| `SUPABASE_SERVICE_ROLE_KEY` | Có (server) | **Không** thêm `NEXT_PUBLIC_`, không commit |
| `NEXT_PUBLIC_ENABLE_AI_SPEECH_COACH` | Không | `false` trong production |
| `NEXT_PUBLIC_MAX_VIDEO_UPLOAD_MB` / `..._AUDIO_..._MB` | Không | Giới hạn hiển thị phía client (bucket Storage vẫn là nguồn giới hạn thật) |

Không commit `.env.local`.

## Chạy development

```bash
pnpm dev
```

Mở `http://localhost:3000`. Đăng nhập bằng tài khoản demo đã tạo ở bước
seed (`pnpm seed:demo`).

## Lint, typecheck, test, build

```bash
pnpm lint         # ESLint (eslint-config-next core-web-vitals + typescript)
pnpm typecheck    # tsc --noEmit
pnpm test         # Vitest — unit test cho logic gamification/RBAC/validation
pnpm test:e2e     # Playwright — cần `pnpm dev`/build chạy sẵn hoặc để Playwright tự khởi động
pnpm build        # next build (production)
```

Build production **không** yêu cầu Supabase project thật — các trang công
khai có fallback dữ liệu mặc định khi chưa cấu hình Supabase (xem
`src/lib/data/public-content.ts`), nên `pnpm build` chạy được ngay cả trong
CI chưa có secret.

## Triển khai Vercel

1. Đẩy repository lên GitHub (xem bên dưới).
2. Trên [vercel.com](https://vercel.com), chọn **New Project**, kết nối
   repository GitHub vừa tạo.
3. Nếu dự án nằm trong monorepo, đặt **Root Directory** trỏ tới thư mục chứa
   `package.json` này. Với repo hiện tại (không phải monorepo), giữ mặc định.
4. Thêm **Environment Variables** (giống `.env.example`, giá trị thật) cho
   cả môi trường Production và Preview.
5. Vercel tự nhận diện Next.js, dùng lệnh build mặc định (`next build`).
6. Sau khi có domain Vercel (hoặc custom domain), quay lại Supabase
   **Authentication > URL Configuration**, thêm domain đó vào Site URL và
   Redirect URLs.
7. Chạy migrations/seed trên Supabase project production **trước** khi
   người dùng thật truy cập (xem mục Migrations ở trên) — Vercel không tự
   chạy migration.
8. Custom domain: cấu hình trong Vercel **Settings > Domains**, sau đó cập
   nhật lại Redirect URLs ở Supabase.

## Tạo tài khoản admin đầu tiên

Khuyến nghị: chạy `pnpm seed:demo` (tạo sẵn 1 admin, 2 giáo viên, 3 phụ
huynh, 5 học viên demo với mật khẩu ngẫu nhiên in ra terminal).

Để tạo admin thủ công cho production (không dùng dữ liệu demo khác):

1. Trong Supabase Dashboard → **Authentication > Users** → **Add user**,
   tạo user với email thật, đặt mật khẩu.
2. Vào **SQL Editor**, chạy:
   ```sql
   update public.profiles set role = 'admin' where id = '<user-id-vừa-tạo>';
   ```
   (Nếu profile chưa tồn tại — hiếm khi xảy ra vì có trigger tự tạo — insert
   thủ công vào `public.profiles` với `role = 'admin'`.)
3. Đăng nhập tại `/dang-nhap` bằng tài khoản này để vào `/admin`.

## Tùy chỉnh logo, màu và nội dung

- **Tên thương hiệu, slogan**: `src/config/site.ts`.
- **Màu sắc, font**: design tokens trong `src/app/globals.css` (khối
  `@theme inline`) — đổi giá trị hex tại `:root` để đổi màu toàn hệ thống.
  Font khai báo tại `src/app/layout.tsx` (`next/font/google`).
- **Logo**: hiện dùng logo dạng chữ (`{siteConfig.organization}`) tại
  `components/layout/public-header.tsx` và `app-sidebar.tsx` — thay bằng
  `<Image>` khi có file logo thật.
- **Nội dung trang chủ/FAQ/testimonial**: sửa trực tiếp trong database qua
  trang `/admin/noi-dung`, hoặc sửa fallback mặc định trong
  `src/config/site.ts` (dùng khi chưa có dữ liệu trong Supabase).
- **Favicon**: thay file `src/app/favicon.ico`.

## Giới hạn của MVP

Được ghi nhận trung thực, không tô vẽ:

- **AI Speech Coach chưa tích hợp AI thật** — chỉ có kiến trúc mở rộng
  (interface, type, mock provider chỉ chạy trong development, feature flag,
  trang "Sắp ra mắt"). Không gọi bất kỳ AI API nào.
- **Quay video/ghi âm trực tiếp trong trình duyệt** chưa được triển khai
  đầy đủ (MediaRecorder API) — MVP hỗ trợ đầy đủ luồng **tải file lên**
  (upload) cho video/âm thanh, đáp ứng yêu cầu cốt lõi của bài tập.
- **Bài luyện nhanh dạng kéo-thả/ghi âm** trong trang bài học: quiz hỗ trợ
  đầy đủ 4 dạng (một đáp án, nhiều đáp án, đúng/sai, sắp xếp thứ tự); dạng
  "ghi âm"/"quay video" cho bài luyện nhanh trong lesson page chưa có giao
  diện riêng — học viên dùng Phòng luyện tập (`/student/luyen-tap`) làm
  kênh luyện tập nhanh theo kỹ năng thay thế.
- **Quản lý nhiều `lesson_sections` (kiến thức cốt lõi) qua giao diện
  admin** chưa có UI CRUD riêng (đã có trong schema + hiển thị ở trang bài
  học) — hiện cập nhật qua SQL/Supabase Studio; form tạo/sửa bài học ở admin
  quản lý các trường chính của `lessons`.
- **"Giao bài bổ sung"** của giáo viên hiện gộp chung với "Gửi thông báo cho
  lớp" tại `/teacher/giao-bai` (một form gửi thông báo tới cả lớp, có thể
  dùng để đề xuất bài luyện tập cụ thể) thay vì một luồng tạo assignment
  ad-hoc độc lập.
- **Rate limiting** cho form đăng ký tư vấn dùng bộ nhớ trong tiến trình,
  không bền vững qua nhiều instance/serverless — phù hợp MVP một instance.
- **Không có email xác thực thật** khi admin tạo tài khoản (dùng
  `email_confirm: true` để đơn giản hóa demo).
- **Chứng nhận (certificate)** chưa sinh file PDF thật — mới quản lý
  metadata (`certificates`, `student_certificates`) và cấp số hiệu; trường
  `template_url`/`file_path` để trống, cần tích hợp dịch vụ sinh PDF sau.
- **Playwright e2e** cho các luồng cần đăng nhập (student/teacher/parent/
  admin) được viết đầy đủ nhưng tự `test.skip` khi chưa cấu hình biến môi
  trường `E2E_<ROLE>_EMAIL`/`E2E_<ROLE>_PASSWORD` trỏ tới một Supabase
  project test đã seed — vì các luồng này cần dữ liệu thật, không thể giả
  lập an toàn mà không có backend. Luồng Guest chạy độc lập, không cần
  backend.
- **Thông tin thương hiệu** (tiểu sử chủ nhiệm, chứng chỉ, học phí, địa chỉ,
  số điện thoại, lịch khai giảng, review thật, số liệu học viên đã đào
  tạo...) **không được bịa** — hiển thị dưới dạng placeholder có nhãn rõ
  ràng, admin có thể cập nhật tại `/admin/noi-dung`.

## Roadmap

- Tích hợp AI Speech Coach thật (phân tích tốc độ nói, khoảng ngừng, ánh
  mắt, sự tự tin) khi có API key và yêu cầu triển khai cụ thể.
- Quay video/ghi âm trực tiếp bằng MediaRecorder API trong trình duyệt.
- Sinh chứng nhận PDF tự động và gửi email thông báo.
- Audit log cho hành động quản trị nhạy cảm.
- Rate limiting tập trung (Upstash Redis) khi scale nhiều instance.
- Đa ngôn ngữ: bổ sung giao diện tiếng Anh (cấu trúc mã nguồn đã sẵn sàng
  cho việc này — xem cách tổ chức `src/config/site.ts`).
