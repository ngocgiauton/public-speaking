import { z } from "zod";

export const consultationLeadSchema = z.object({
  student_full_name: z.string().min(2, "Vui lòng nhập họ tên học viên").max(100),
  student_date_of_birth: z.string().optional().or(z.literal("")),
  school: z.string().max(150).optional().or(z.literal("")),
  english_level: z.string().max(50).optional().or(z.literal("")),
  parent_full_name: z.string().min(2, "Vui lòng nhập họ tên phụ huynh").max(100),
  phone: z
    .string()
    .min(8, "Số điện thoại không hợp lệ")
    .regex(/^[0-9+\s()-]{8,15}$/u, "Số điện thoại không hợp lệ"),
  email: z.string().email("Email không hợp lệ").optional().or(z.literal("")),
  learning_goal: z.string().max(500).optional().or(z.literal("")),
  preferred_format: z.enum(["online", "offline", "either"]).optional(),
  preferred_schedule: z.string().max(200).optional().or(z.literal("")),
  note: z.string().max(1000).optional().or(z.literal("")),
  consent: z.literal("on"),
});

export type ConsultationLeadInput = z.infer<typeof consultationLeadSchema>;
