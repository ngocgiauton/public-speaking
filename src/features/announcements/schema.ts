import { z } from "zod";

export const createAnnouncementSchema = z.object({
  classId: z.string().uuid(),
  title: z.string().min(3, "Tiêu đề cần ít nhất 3 ký tự").max(200),
  body: z.string().min(3, "Nội dung cần ít nhất 3 ký tự").max(2000),
});

export type CreateAnnouncementInput = z.infer<typeof createAnnouncementSchema>;
