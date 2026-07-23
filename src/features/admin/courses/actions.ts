"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth/session";
import { createCourseSchema, createLevelSchema } from "@/features/admin/courses/schema";
import type { ActionState } from "@/features/auth/actions";

export async function createCourseAction(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  await requireRole("admin");
  const parsed = createCourseSchema.safeParse({
    title: formData.get("title"),
    slug: formData.get("slug"),
    description: formData.get("description") || undefined,
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Dữ liệu không hợp lệ." };

  const supabase = await createClient();
  const { error } = await supabase.from("courses").insert({
    title: parsed.data.title,
    slug: parsed.data.slug,
    description: parsed.data.description || null,
  });
  if (error) return { error: "Không thể tạo khóa học (slug có thể đã tồn tại)." };

  revalidatePath("/admin/khoa-hoc");
  return { success: "Đã tạo khóa học." };
}

export async function toggleCoursePublishAction(courseId: string, isPublished: boolean): Promise<ActionState> {
  await requireRole("admin");
  const supabase = await createClient();
  const { error } = await supabase.from("courses").update({ is_published: isPublished }).eq("id", courseId);
  if (error) return { error: "Không thể cập nhật trạng thái xuất bản." };
  revalidatePath("/admin/khoa-hoc");
  revalidatePath("/lo-trinh");
  return { success: isPublished ? "Đã xuất bản khóa học." : "Đã ẩn khóa học." };
}

export async function createLevelAction(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  await requireRole("admin");
  const parsed = createLevelSchema.safeParse({
    courseId: formData.get("courseId"),
    orderIndex: formData.get("orderIndex"),
    slug: formData.get("slug"),
    name: formData.get("name"),
    description: formData.get("description") || undefined,
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Dữ liệu không hợp lệ." };

  const supabase = await createClient();
  const { error } = await supabase.from("course_levels").insert({
    course_id: parsed.data.courseId,
    order_index: parsed.data.orderIndex,
    slug: parsed.data.slug,
    name: parsed.data.name,
    description: parsed.data.description || null,
  });
  if (error) return { error: "Không thể tạo level (order_index có thể đã tồn tại cho khóa học này)." };

  revalidatePath("/admin/level");
  return { success: "Đã tạo level." };
}
