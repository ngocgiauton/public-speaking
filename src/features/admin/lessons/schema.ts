import { z } from "zod";

export const lessonFormSchema = z.object({
  courseLevelId: z.string().uuid(),
  sessionNumber: z.coerce.number().int().min(1).max(999),
  slug: z.string().min(2).max(150),
  title: z.string().min(3).max(200),
  shortDescription: z.string().max(500).optional().or(z.literal("")),
  durationMinutes: z.coerce.number().int().min(1).max(300),
  videoUrl: z.string().url().optional().or(z.literal("")),
  xpReward: z.coerce.number().int().min(0).max(1000),
  objectives: z.string().max(2000).optional().or(z.literal("")),
  keyTakeaways: z.string().max(2000).optional().or(z.literal("")),
  isPublished: z.enum(["true", "false"]).optional(),
});

export function linesToJsonArray(text: string): string[] {
  return text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}
