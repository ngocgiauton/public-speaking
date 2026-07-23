import type { Metadata } from "next";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { LoginForm } from "@/components/forms/login-form";

export const metadata: Metadata = { title: "Đăng nhập", robots: { index: false } };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ redirectTo?: string; error?: string }>;
}) {
  const params = await searchParams;
  const errorMessage =
    params.error === "account_locked" ? "Tài khoản của bạn đã bị khóa. Vui lòng liên hệ quản trị viên." : undefined;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Đăng nhập</CardTitle>
        <CardDescription>Đăng nhập để vào khu vực học viên, phụ huynh, giáo viên hoặc quản trị.</CardDescription>
      </CardHeader>
      <CardContent>
        <LoginForm redirectTo={params.redirectTo} initialError={errorMessage} />
      </CardContent>
    </Card>
  );
}
