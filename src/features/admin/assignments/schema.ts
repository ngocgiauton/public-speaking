import { z } from "zod";
import { RUBRIC_GROUPS } from "@/config/gamification";

export const assignmentFormSchema = z.object({
  lessonId: z.string().uuid(),
  title: z.string().min(3).max(200),
  description: z.string().max(1000).optional().or(z.literal("")),
  instructions: z.string().max(2000).optional().or(z.literal("")),
  assignmentType: z.enum(["main", "practice"]),
  allowedVideo: z.enum(["on"]).optional(),
  allowedAudio: z.enum(["on"]).optional(),
  maxVideoMb: z.coerce.number().int().min(1).max(2000),
  maxAudioMb: z.coerce.number().int().min(1).max(2000),
  dueOffsetDays: z.coerce.number().int().min(0).max(365).optional().or(z.literal("")),
  minPassScore: z.coerce.number().int().min(0).max(100),
  xpReward: z.coerce.number().int().min(0).max(1000),
  criteria: z.array(z.string()).optional().default([]),
  isPublished: z.enum(["true", "false"]).optional(),
});

export const ALL_RUBRIC_CRITERIA = RUBRIC_GROUPS.flatMap((group) =>
  group.criteria.map((c) => ({ groupKey: group.key, groupLabel: group.label, ...c })),
);
