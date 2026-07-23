import { z } from "zod";

export const saveDraftSchema = z.object({
  submissionId: z.string().uuid().optional(),
  assignmentId: z.string().uuid(),
  title: z.string().max(200).optional().or(z.literal("")),
  notes: z.string().max(1000).optional().or(z.literal("")),
});

export type SaveDraftInput = z.infer<typeof saveDraftSchema>;

export const attachFileSchema = z.object({
  submissionId: z.string().uuid(),
  storagePath: z.string().min(1),
  fileType: z.enum(["video", "audio"]),
  originalFilename: z.string().max(255),
  mimeType: z.string().max(100),
  sizeBytes: z.number().int().positive(),
});

export type AttachFileInput = z.infer<typeof attachFileSchema>;
