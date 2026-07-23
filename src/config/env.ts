import { z } from "zod";

const publicEnvSchema = z.object({
  NEXT_PUBLIC_APP_URL: z.string().default("http://localhost:3000"),
  NEXT_PUBLIC_SUPABASE_URL: z.string().min(1, "Thiếu NEXT_PUBLIC_SUPABASE_URL"),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z
    .string()
    .min(1, "Thiếu NEXT_PUBLIC_SUPABASE_ANON_KEY"),
  NEXT_PUBLIC_ENABLE_AI_SPEECH_COACH: z
    .string()
    .default("false")
    .transform((v) => v === "true"),
  NEXT_PUBLIC_MAX_VIDEO_UPLOAD_MB: z.coerce.number().default(200),
  NEXT_PUBLIC_MAX_AUDIO_UPLOAD_MB: z.coerce.number().default(50),
});

function readPublicEnv() {
  const parsed = publicEnvSchema.safeParse({
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    NEXT_PUBLIC_ENABLE_AI_SPEECH_COACH:
      process.env.NEXT_PUBLIC_ENABLE_AI_SPEECH_COACH,
    NEXT_PUBLIC_MAX_VIDEO_UPLOAD_MB: process.env.NEXT_PUBLIC_MAX_VIDEO_UPLOAD_MB,
    NEXT_PUBLIC_MAX_AUDIO_UPLOAD_MB: process.env.NEXT_PUBLIC_MAX_AUDIO_UPLOAD_MB,
  });

  if (!parsed.success) {
    // In build/lint contexts (CI without secrets) we fall back to safe
    // placeholders so `next build`/typecheck do not require live secrets.
    // Runtime pages that actually call Supabase will fail loudly instead.
    return {
      NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
      NEXT_PUBLIC_SUPABASE_URL:
        process.env.NEXT_PUBLIC_SUPABASE_URL ?? "http://localhost:54321",
      NEXT_PUBLIC_SUPABASE_ANON_KEY:
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "placeholder-anon-key",
      NEXT_PUBLIC_ENABLE_AI_SPEECH_COACH:
        process.env.NEXT_PUBLIC_ENABLE_AI_SPEECH_COACH === "true",
      NEXT_PUBLIC_MAX_VIDEO_UPLOAD_MB: Number(
        process.env.NEXT_PUBLIC_MAX_VIDEO_UPLOAD_MB ?? 200,
      ),
      NEXT_PUBLIC_MAX_AUDIO_UPLOAD_MB: Number(
        process.env.NEXT_PUBLIC_MAX_AUDIO_UPLOAD_MB ?? 50,
      ),
    };
  }

  return parsed.data;
}

export const publicEnv = readPublicEnv();

export function getServiceRoleKey(): string {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY chưa được cấu hình. Biến này chỉ được dùng ở phía server.",
    );
  }
  return key;
}
