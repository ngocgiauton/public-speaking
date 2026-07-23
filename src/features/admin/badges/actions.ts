"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth/session";
import { badgeFormSchema } from "@/features/admin/badges/schema";
import type { ActionState } from "@/features/auth/actions";

export async function createBadgeAction(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  await requireRole("admin");
  const parsed = badgeFormSchema.safeParse({
    slug: formData.get("slug"),
    name: formData.get("name"),
    description: formData.get("description") || undefined,
    icon: formData.get("icon"),
    criteriaType: formData.get("criteriaType"),
    rarity: formData.get("rarity"),
    isActive: formData.get("isActive") ? "true" : "false",
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Dữ liệu không hợp lệ." };

  const supabase = await createClient();
  const { error } = await supabase.from("badges").insert({
    slug: parsed.data.slug,
    name: parsed.data.name,
    description: parsed.data.description || null,
    icon: parsed.data.icon,
    criteria_type: parsed.data.criteriaType,
    rarity: parsed.data.rarity,
    is_active: parsed.data.isActive === "true",
  });
  if (error) return { error: "Không thể tạo huy hiệu (slug có thể đã tồn tại)." };

  revalidatePath("/admin/huy-hieu");
  return { success: "Đã tạo huy hiệu." };
}

export async function toggleBadgeActiveAction(badgeId: string, isActive: boolean): Promise<ActionState> {
  await requireRole("admin");
  const supabase = await createClient();
  const { error } = await supabase.from("badges").update({ is_active: isActive }).eq("id", badgeId);
  if (error) return { error: "Không thể cập nhật huy hiệu." };
  revalidatePath("/admin/huy-hieu");
  return { success: "Đã cập nhật." };
}
