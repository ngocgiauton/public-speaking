import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ProfileForm } from "@/components/forms/profile-form";
import { publicEnv } from "@/config/env";
import { getCurrentUser } from "@/lib/auth/session";

export const metadata: Metadata = { title: "Cài đặt", robots: { index: false } };

export default async function AdminSettingsPage() {
  const user = await getCurrentUser();

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      <PageHeader title="Cài đặt" breadcrumbs={[{ label: "Tổng quan", href: "/admin" }, { label: "Cài đặt" }]} />

      <Card>
        <CardHeader>
          <CardTitle>Cấu hình hệ thống</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3 text-sm">
          <div className="flex items-center justify-between">
            <span>AI Speech Coach</span>
            <Badge variant={publicEnv.NEXT_PUBLIC_ENABLE_AI_SPEECH_COACH ? "success" : "neutral"}>
              {publicEnv.NEXT_PUBLIC_ENABLE_AI_SPEECH_COACH ? "Đang bật" : "Chưa bật (Sắp ra mắt)"}
            </Badge>
          </div>
          <div className="flex items-center justify-between">
            <span>Dung lượng video tối đa</span>
            <span>{publicEnv.NEXT_PUBLIC_MAX_VIDEO_UPLOAD_MB} MB</span>
          </div>
          <div className="flex items-center justify-between">
            <span>Dung lượng âm thanh tối đa</span>
            <span>{publicEnv.NEXT_PUBLIC_MAX_AUDIO_UPLOAD_MB} MB</span>
          </div>
          <p className="text-xs text-muted-foreground">
            Các giá trị này được cấu hình qua environment variables (xem README.md). Thay đổi yêu cầu cập
            nhật biến môi trường và triển khai lại ứng dụng.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Hồ sơ quản trị viên</CardTitle>
        </CardHeader>
        <CardContent>
          <ProfileForm
            profileId={user!.id}
            fullName={user!.profile.full_name}
            phone={user!.profile.phone}
            avatarUrl={user!.profile.avatar_url}
            email={user!.email}
          />
        </CardContent>
      </Card>
    </div>
  );
}
