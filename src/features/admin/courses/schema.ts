import { z } from "zod";

export const createCourseSchema = z.object({
  title: z.string().min(3, "Tiêu đề cần ít nhất 3 ký tự").max(200),
  slug: z
    .string()
    .min(3)
    .max(200)
    .regex(/^[a-z0-9-]+$/, "Slug chỉ gồm chữ thường, số và dấu gạch ngang"),
  description: z.string().max(2000).optional().or(z.literal("")),
});

export const createLevelSchema = z.object({
  courseId: z.string().uuid(),
  orderIndex: z.coerce.number().int().min(0).max(5),
  slug: z.string().min(2).max(100),
  name: z.string().min(2).max(150),
  description: z.string().max(1000).optional().or(z.literal("")),
});
