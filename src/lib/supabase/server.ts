import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import type { Database } from "@/types/database";
import { publicEnv } from "@/config/env";

/**
 * Server-side Supabase client — chạy trong Server Component / Server Action /
 * Route Handler. Dùng cookie phiên đăng nhập của người dùng nên mọi truy vấn
 * đều bị ràng buộc bởi Row Level Security. Không dùng client này để bypass RLS.
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(
    publicEnv.NEXT_PUBLIC_SUPABASE_URL,
    publicEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            for (const { name, value, options } of cookiesToSet) {
              cookieStore.set(name, value, options);
            }
          } catch {
            // setAll được gọi từ Server Component (không có quyền set cookie).
            // proxy.ts đã đảm nhiệm việc làm mới session trong trường hợp này.
          }
        },
      },
    },
  );
}
