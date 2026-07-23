"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth/session";
import type { ActionState } from "@/features/auth/actions";
import type { LeadStatus } from "@/types/database";

export async function updateLeadStatusAction(leadId: string, status: LeadStatus): Promise<ActionState> {
  await requireRole("admin");
  const supabase = await createClient();
  const { error } = await supabase.from("consultation_leads").update({ status }).eq("id", leadId);
  if (error) return { error: "Không thể cập nhật trạng thái." };
  revalidatePath("/admin/dang-ky-tu-van");
  return { success: "Đã cập nhật trạng thái." };
}
