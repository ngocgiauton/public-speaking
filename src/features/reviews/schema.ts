import { z } from "zod";
import { TEACHER_BONUS_XP_LIMIT } from "@/config/gamification";

export const submitReviewSchema = z.object({
  submissionId: z.string().uuid(),
  decision: z.enum(["approved", "revision_requested", "rejected"]),
  overallComment: z.string().max(2000).optional().or(z.literal("")),
  strengths: z.string().max(1000).optional().or(z.literal("")),
  improvements: z.string().max(1000).optional().or(z.literal("")),
  scores: z.record(z.string(), z.coerce.number().min(0)),
  bonusXp: z.coerce.number().min(0).max(TEACHER_BONUS_XP_LIMIT).optional().default(0),
});

export type SubmitReviewInput = z.infer<typeof submitReviewSchema>;
