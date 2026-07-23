import { z } from "zod";

export const createClassSchema = z.object({
  courseId: z.string().uuid(),
  name: z.string().min(2, "Tên lớp cần ít nhất 2 ký tự").max(150),
  startDate: z.string().optional().or(z.literal("")),
});

export const assignTeacherSchema = z.object({
  classId: z.string().uuid(),
  teacherProfileId: z.string().uuid(),
});

export const enrollStudentSchema = z.object({
  classId: z.string().uuid(),
  studentProfileId: z.string().uuid(),
});
