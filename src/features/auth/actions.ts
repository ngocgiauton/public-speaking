"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { forgotPasswordSchema, loginSchema } from "@/features/auth/schema";
import { publicEnv } from "@/config/env";

export interface ActionState {
  error?: string;
  success?: string;
}

export async function signInAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dữ liệu không hợp lệ" };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword(parsed.data);

  if (error) {
    return { error: "Email hoặc mật khẩu không đúng." };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, status")
    .eq("id", data.user.id)
    .maybeSingle();

  if (!profile) {
    await supabase.auth.signOut();
    return { error: "Tài khoản chưa được thiết lập hồ sơ. Vui lòng liên hệ quản trị viên." };
  }

  if (profile.status === "locked") {
    await supabase.auth.signOut();
    return { error: "Tài khoản của bạn đã bị khóa. Vui lòng liên hệ quản trị viên." };
  }

  const redirectTo = formData.get("redirectTo");
  if (typeof redirectTo === "string" && redirectTo.startsWith(`/${profile.role}`)) {
    redirect(redirectTo);
  }

  redirect(`/${profile.role}`);
}

export async function signOutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}

export async function requestPasswordResetAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = forgotPasswordSchema.safeParse({ email: formData.get("email") });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dữ liệu không hợp lệ" };
  }

  const supabase = await createClient();
  await supabase.auth.resetPasswordForEmail(parsed.data.email, {
    redirectTo: `${publicEnv.NEXT_PUBLIC_APP_URL}/dat-lai-mat-khau`,
  });

  // Luôn trả về thông báo thành công (kể cả khi email không tồn tại) để
  // tránh lộ thông tin email nào đã đăng ký trong hệ thống.
  return {
    success:
      "Nếu email tồn tại trong hệ thống, một liên kết đặt lại mật khẩu đã được gửi tới hộp thư của bạn.",
  };
}
