"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth/session";
import { updateProfileSchema } from "@/features/auth/schema";
import type { ActionState } from "@/features/auth/actions";

export async function updateProfileAction(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  const user = await getCurrentUser();
  if (!user) return { error: "Bạn cần đăng nhập." };

  const parsed = updateProfileSchema.safeParse({
    full_name: formData.get("full_name"),
    phone: formData.get("phone") || "",
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dữ liệu không hợp lệ." };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("profiles")
    .update({ full_name: parsed.data.full_name, phone: parsed.data.phone || null })
    .eq("id", user.id);

  if (error) return { error: "Không thể cập nhật hồ sơ." };

  revalidatePath("/", "layout");
  return { success: "Đã cập nhật hồ sơ." };
}

export async function updateAvatarAction(avatarPath: string): Promise<ActionState> {
  const user = await getCurrentUser();
  if (!user) return { error: "Bạn cần đăng nhập." };

  const supabase = await createClient();
  const {
    data: { publicUrl },
  } = supabase.storage.from("avatars").getPublicUrl(avatarPath);

  const { error } = await supabase.from("profiles").update({ avatar_url: publicUrl }).eq("id", user.id);
  if (error) return { error: "Không thể cập nhật ảnh đại diện." };

  revalidatePath("/", "layout");
  return { success: "Đã cập nhật ảnh đại diện." };
}
