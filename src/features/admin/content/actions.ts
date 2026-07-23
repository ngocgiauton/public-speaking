"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth/session";
import type { ActionState } from "@/features/auth/actions";

const faqSchema = z.object({
  question: z.string().min(3).max(300),
  answer: z.string().min(3).max(2000),
  orderIndex: z.coerce.number().int().min(0).max(100).default(0),
});

export async function createFaqItemAction(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  await requireRole("admin");
  const parsed = faqSchema.safeParse({
    question: formData.get("question"),
    answer: formData.get("answer"),
    orderIndex: formData.get("orderIndex") || 0,
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Dữ liệu không hợp lệ." };

  const supabase = await createClient();
  const { error } = await supabase.from("faq_items").insert({
    question: parsed.data.question,
    answer: parsed.data.answer,
    order_index: parsed.data.orderIndex,
  });
  if (error) return { error: "Không thể tạo câu hỏi FAQ." };

  revalidatePath("/admin/noi-dung");
  revalidatePath("/cau-hoi-thuong-gap");
  return { success: "Đã thêm câu hỏi FAQ." };
}

export async function toggleFaqPublishAction(faqId: string, isPublished: boolean): Promise<ActionState> {
  await requireRole("admin");
  const supabase = await createClient();
  const { error } = await supabase.from("faq_items").update({ is_published: isPublished }).eq("id", faqId);
  if (error) return { error: "Không thể cập nhật." };
  revalidatePath("/admin/noi-dung");
  revalidatePath("/cau-hoi-thuong-gap");
  return { success: "Đã cập nhật." };
}

const testimonialSchema = z.object({
  authorName: z.string().min(2).max(150),
  authorRole: z.string().max(100).optional().or(z.literal("")),
  content: z.string().min(3).max(1000),
  isPlaceholder: z.enum(["true", "false"]).optional(),
});

export async function createTestimonialAction(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  await requireRole("admin");
  const parsed = testimonialSchema.safeParse({
    authorName: formData.get("authorName"),
    authorRole: formData.get("authorRole") || undefined,
    content: formData.get("content"),
    isPlaceholder: formData.get("isPlaceholder") ? "true" : "false",
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Dữ liệu không hợp lệ." };

  const supabase = await createClient();
  const { error } = await supabase.from("testimonials").insert({
    author_name: parsed.data.authorName,
    author_role: parsed.data.authorRole || null,
    content: parsed.data.content,
    is_placeholder: parsed.data.isPlaceholder === "true",
  });
  if (error) return { error: "Không thể tạo testimonial." };

  revalidatePath("/admin/noi-dung");
  revalidatePath("/");
  return { success: "Đã thêm phản hồi." };
}

export async function toggleTestimonialPublishAction(id: string, isPublished: boolean): Promise<ActionState> {
  await requireRole("admin");
  const supabase = await createClient();
  const { error } = await supabase.from("testimonials").update({ is_published: isPublished }).eq("id", id);
  if (error) return { error: "Không thể cập nhật." };
  revalidatePath("/admin/noi-dung");
  revalidatePath("/");
  return { success: "Đã cập nhật." };
}

const siteSettingSchema = z.object({
  key: z.string().min(1).max(100),
  value: z.string().min(1).max(2000),
});

export async function updateSiteSettingAction(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  await requireRole("admin");
  const parsed = siteSettingSchema.safeParse({
    key: formData.get("key"),
    value: formData.get("value"),
  });
  if (!parsed.success) return { error: "Dữ liệu không hợp lệ." };

  const supabase = await createClient();
  const { error } = await supabase
    .from("site_settings")
    .upsert({ key: parsed.data.key, value: { note: parsed.data.value } });
  if (error) return { error: "Không thể cập nhật cài đặt." };

  revalidatePath("/admin/noi-dung");
  return { success: "Đã cập nhật nội dung." };
}
