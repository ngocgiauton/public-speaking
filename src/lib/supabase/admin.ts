import "server-only";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";
import { publicEnv } from "@/config/env";
import { getServiceRoleKey } from "@/config/env";

/**
 * Client dùng service role key — CHỈ được import trong route handler hoặc
 * server action tin cậy (ví dụ: server quản trị gán vai trò, ghi XP transaction,
 * duyệt bài). `import "server-only"` sẽ khiến build thất bại nếu file này vô
 * tình bị import vào một Client Component.
 *
 * Không bao giờ export hoặc truyền client này (hay service role key) tới trình
 * duyệt.
 */
export function createAdminClient() {
  return createSupabaseClient<Database>(
    publicEnv.NEXT_PUBLIC_SUPABASE_URL,
    getServiceRoleKey(),
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    },
  );
}
