"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth/session";
import type { ActionState } from "@/features/auth/actions";

const certificateFormSchema = z.object({
  courseId: z.string().uuid(),
  name: z.string().min(3).max(200),
  description: z.string().max(1000).optional().or(z.literal("")),
});

export async function createCertificateAction(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  await requireRole("admin");
  const parsed = certificateFormSchema.safeParse({
    courseId: formData.get("courseId"),
    name: formData.get("name"),
    description: formData.get("description") || undefined,
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Dữ liệu không hợp lệ." };

  const supabase = await createClient();
  const { error } = await supabase.from("certificates").insert({
    course_id: parsed.data.courseId,
    name: parsed.data.name,
    description: parsed.data.description || null,
  });
  if (error) return { error: "Không thể tạo chứng nhận." };

  revalidatePath("/admin/chung-nhan");
  return { success: "Đã tạo mẫu chứng nhận." };
}

const issueCertificateSchema = z.object({
  studentProfileId: z.string().uuid(),
  certificateId: z.string().uuid(),
});

export async function issueCertificateAction(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  await requireRole("admin");
  const parsed = issueCertificateSchema.safeParse({
    studentProfileId: formData.get("studentProfileId"),
    certificateId: formData.get("certificateId"),
  });
  if (!parsed.success) return { error: "Vui lòng chọn học viên và chứng nhận hợp lệ." };

  const certificateNumber = `RPSC-${new Date().getFullYear()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;

  const supabase = await createClient();
  const { error } = await supabase.from("student_certificates").insert({
    student_profile_id: parsed.data.studentProfileId,
    certificate_id: parsed.data.certificateId,
    certificate_number: certificateNumber,
  });
  if (error) return { error: "Không thể cấp chứng nhận (có thể học viên đã được cấp chứng nhận này)." };

  revalidatePath("/admin/chung-nhan");
  return { success: `Đã cấp chứng nhận, số hiệu ${certificateNumber}.` };
}
