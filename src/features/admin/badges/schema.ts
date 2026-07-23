import { z } from "zod";

export const badgeFormSchema = z.object({
  slug: z
    .string()
    .min(2)
    .max(100)
    .regex(/^[a-z0-9-]+$/, "Slug chỉ gồm chữ thường, số và dấu gạch ngang"),
  name: z.string().min(2).max(150),
  description: z.string().max(500).optional().or(z.literal("")),
  icon: z.string().min(1).max(50),
  criteriaType: z.enum(["lesson_complete", "quiz_score", "assignment_approved", "streak", "total_xp", "skill_score", "manual"]),
  rarity: z.enum(["common", "rare", "epic", "legendary"]),
  isActive: z.enum(["true", "false"]).optional(),
});
