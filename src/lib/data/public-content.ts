import { createClient } from "@/lib/supabase/server";
import { faqItems as faqFallback } from "@/config/site";
import type { CourseLevelRow, CourseRow, FaqItemRow, LessonRow, TestimonialRow } from "@/types/database";

/**
 * Lớp truy cập dữ liệu cho các trang công khai. Bọc try/catch để trang chủ
 * và các trang marketing vẫn hiển thị được (dùng nội dung mặc định trong
 * code) ngay cả khi chưa cấu hình Supabase — hữu ích khi build/preview mà
 * chưa có project Supabase thật, đồng thời là một lớp chống lỗi hợp lý cho
 * production nếu database tạm thời không phản hồi.
 */

export async function getPublishedFaqItems(): Promise<FaqItemRow[] | null> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("faq_items")
      .select("*")
      .eq("is_published", true)
      .order("order_index", { ascending: true });
    if (error) throw error;
    return data;
  } catch {
    return null;
  }
}

export function getFaqFallback() {
  return faqFallback.map((item, index) => ({
    id: `fallback-${index}`,
    question: item.question,
    answer: item.answer,
    order_index: index,
    is_published: true,
  }));
}

export async function getPublishedTestimonials(): Promise<TestimonialRow[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("testimonials")
      .select("*")
      .eq("is_published", true)
      .order("order_index", { ascending: true });
    if (error) throw error;
    return data ?? [];
  } catch {
    return [];
  }
}

export interface CourseOverview {
  course: CourseRow;
  levels: (CourseLevelRow & { lessons: LessonRow[] })[];
}

export async function getPublishedCourseOverview(): Promise<CourseOverview | null> {
  try {
    const supabase = await createClient();
    const { data: course, error: courseError } = await supabase
      .from("courses")
      .select("*")
      .eq("is_published", true)
      .order("created_at", { ascending: true })
      .limit(1)
      .maybeSingle();
    if (courseError || !course) throw courseError ?? new Error("Không tìm thấy khóa học");

    const { data: levels, error: levelsError } = await supabase
      .from("course_levels")
      .select("*")
      .eq("course_id", course.id)
      .order("order_index", { ascending: true });
    if (levelsError) throw levelsError;

    const { data: lessons, error: lessonsError } = await supabase
      .from("lessons")
      .select("*")
      .in("course_level_id", (levels ?? []).map((l) => l.id))
      .eq("is_published", true)
      .order("session_number", { ascending: true });
    if (lessonsError) throw lessonsError;

    return {
      course,
      levels: (levels ?? []).map((level) => ({
        ...level,
        lessons: (lessons ?? []).filter((l) => l.course_level_id === level.id),
      })),
    };
  } catch {
    return null;
  }
}
