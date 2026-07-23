import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { publicEnv } from "@/config/env";

const PROTECTED_PREFIXES = ["/student", "/parent", "/teacher", "/admin"];

/**
 * Next.js 16 đổi tên `middleware` thành `proxy` (chạy trên nodejs runtime).
 * Vai trò của proxy ở đây:
 *   1. Làm mới session Supabase (refresh access token) trên mỗi request.
 *   2. Chặn sớm truy cập vào khu vực riêng tư khi chưa đăng nhập.
 * Việc kiểm tra ĐÚNG vai trò (student/parent/teacher/admin) được thực hiện ở
 * lớp sâu hơn trong `requireRole()` (server component), vì proxy không nên
 * truy vấn bảng `profiles` trên mỗi request để tránh round-trip không cần thiết.
 */
export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    publicEnv.NEXT_PUBLIC_SUPABASE_URL,
    publicEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          for (const { name, value } of cookiesToSet) {
            request.cookies.set(name, value);
          }
          response = NextResponse.next({ request });
          for (const { name, value, options } of cookiesToSet) {
            response.cookies.set(name, value, options);
          }
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;
  const isProtected = PROTECTED_PREFIXES.some((prefix) => pathname.startsWith(prefix));

  if (isProtected && !user) {
    const loginUrl = new URL("/dang-nhap", request.url);
    loginUrl.searchParams.set("redirectTo", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|mp4)$).*)",
  ],
};
