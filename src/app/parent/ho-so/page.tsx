import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { ProfileForm } from "@/components/forms/profile-form";
import { getCurrentUser } from "@/lib/auth/session";

export const metadata: Metadata = { title: "Hồ sơ", robots: { index: false } };

export default async function ParentProfilePage() {
  const user = await getCurrentUser();

  return (
    <div className="mx-auto flex max-w-xl flex-col gap-6">
      <PageHeader title="Hồ sơ của tôi" breadcrumbs={[{ label: "Tổng quan", href: "/parent" }, { label: "Hồ sơ" }]} />
      <Card>
        <CardContent className="p-6">
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
