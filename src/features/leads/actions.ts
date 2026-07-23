"use server";

import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { consultationLeadSchema } from "@/features/leads/schema";
import type { ActionState } from "@/features/auth/actions";

const submissionTimestamps = new Map<string, number>();
const RATE_LIMIT_WINDOW_MS = 60_000;

/** Chống gửi trùng liên tục: giới hạn 1 lần gửi / IP / phút (in-memory, phù hợp MVP). */
function isRateLimited(key: string): boolean {
  const last = submissionTimestamps.get(key);
  const now = Date.now();
  if (last && now - last < RATE_LIMIT_WINDOW_MS) {
    return true;
  }
  submissionTimestamps.set(key, now);
  return false;
}

export async function submitConsultationLeadAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const headerList = await headers();
  const clientIp = headerList.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";

  if (isRateLimited(clientIp)) {
    return { error: "Bạn vừa gửi đăng ký. Vui lòng thử lại sau ít phút." };
  }

  const parsed = consultationLeadSchema.safeParse({
    student_full_name: formData.get("student_full_name"),
    student_date_of_birth: formData.get("student_date_of_birth") || undefined,
    school: formData.get("school") || undefined,
    english_level: formData.get("english_level") || undefined,
    parent_full_name: formData.get("parent_full_name"),
    phone: formData.get("phone"),
    email: formData.get("email") || undefined,
    learning_goal: formData.get("learning_goal") || undefined,
    preferred_format: formData.get("preferred_format") || undefined,
    preferred_schedule: formData.get("preferred_schedule") || undefined,
    note: formData.get("note") || undefined,
    consent: formData.get("consent"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dữ liệu không hợp lệ, vui lòng kiểm tra lại." };
  }

  const { consent: _consent, ...leadData } = parsed.data;

  const supabase = await createClient();
  const { error } = await supabase.from("consultation_leads").insert({
    student_full_name: leadData.student_full_name,
    student_date_of_birth: leadData.student_date_of_birth || null,
    school: leadData.school || null,
    english_level: leadData.english_level || null,
    parent_full_name: leadData.parent_full_name,
    phone: leadData.phone,
    email: leadData.email || null,
    learning_goal: leadData.learning_goal || null,
    preferred_format: leadData.preferred_format || null,
    preferred_schedule: leadData.preferred_schedule || null,
    note: leadData.note || null,
  });

  if (error) {
    return { error: "Gửi đăng ký thất bại. Vui lòng thử lại sau." };
  }

  return { success: "Cảm ơn bạn đã đăng ký! Đội ngũ Royal Public Speaking Club sẽ liên hệ sớm nhất." };
}
