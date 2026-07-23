"use client";

import { createClient } from "@/lib/supabase/client";
import { publicEnv } from "@/config/env";

export interface UploadResult {
  path: string;
  error: string | null;
}

const VIDEO_MIME_TYPES = ["video/mp4", "video/webm", "video/quicktime"];
const AUDIO_MIME_TYPES = ["audio/mpeg", "audio/mp4", "audio/webm"];
const IMAGE_MIME_TYPES = ["image/png", "image/jpeg", "image/webp"];

function sanitizeExtension(filename: string): string {
  const parts = filename.split(".");
  const ext = parts.length > 1 ? parts.pop() : "";
  return (ext ?? "").toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 8) || "bin";
}

/**
 * Tạo tên file không xung đột, không tin filename gốc do người dùng gửi lên
 * (chỉ giữ lại phần đuôi mở rộng đã được làm sạch).
 */
export function generateSafeFileName(originalName: string): string {
  const ext = sanitizeExtension(originalName);
  const unique = crypto.randomUUID();
  return `${unique}.${ext}`;
}

export interface ValidateFileOptions {
  maxMb: number;
  allowedTypes: string[];
}

export function validateFile(
  file: File,
  options: ValidateFileOptions,
): { valid: true } | { valid: false; error: string } {
  if (!options.allowedTypes.includes(file.type)) {
    return { valid: false, error: `Định dạng file "${file.type}" không được hỗ trợ.` };
  }
  const maxBytes = options.maxMb * 1024 * 1024;
  if (file.size > maxBytes) {
    return { valid: false, error: `File vượt quá dung lượng tối đa ${options.maxMb}MB.` };
  }
  return { valid: true };
}

export async function uploadSubmissionMedia(
  file: File,
  studentProfileId: string,
  submissionId: string,
  kind: "video" | "audio",
  onProgress?: (percent: number) => void,
): Promise<UploadResult> {
  const validation = validateFile(file, {
    maxMb: kind === "video" ? publicEnv.NEXT_PUBLIC_MAX_VIDEO_UPLOAD_MB : publicEnv.NEXT_PUBLIC_MAX_AUDIO_UPLOAD_MB,
    allowedTypes: kind === "video" ? VIDEO_MIME_TYPES : AUDIO_MIME_TYPES,
  });
  if (!validation.valid) {
    return { path: "", error: validation.error };
  }

  const supabase = createClient();
  const path = `${studentProfileId}/${submissionId}/${generateSafeFileName(file.name)}`;

  onProgress?.(10);
  const { error } = await supabase.storage.from("submission-media").upload(path, file, {
    cacheControl: "3600",
    upsert: false,
  });
  onProgress?.(error ? 0 : 100);

  if (error) {
    return { path: "", error: `Tải lên thất bại: ${error.message}` };
  }

  return { path, error: null };
}

export async function uploadAvatar(file: File, profileId: string): Promise<UploadResult> {
  const validation = validateFile(file, { maxMb: 5, allowedTypes: IMAGE_MIME_TYPES });
  if (!validation.valid) {
    return { path: "", error: validation.error };
  }

  const supabase = createClient();
  const path = `${profileId}/${generateSafeFileName(file.name)}`;

  const { error } = await supabase.storage.from("avatars").upload(path, file, {
    cacheControl: "3600",
    upsert: true,
  });

  if (error) {
    return { path: "", error: `Tải lên thất bại: ${error.message}` };
  }

  return { path, error: null };
}
