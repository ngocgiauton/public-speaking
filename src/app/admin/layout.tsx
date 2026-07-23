import { RoleGuard } from "@/components/shared/role-guard";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { AppHeader } from "@/components/layout/app-header";
import { MobileNavigation } from "@/components/layout/mobile-navigation";
import { adminNav, roleLabels } from "@/config/nav";
import { getCurrentUser } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";

export const metadata = { robots: { index: false } };

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <RoleGuard roles={["admin"]}>
      <AdminShell>{children}</AdminShell>
    </RoleGuard>
  );
}

async function AdminShell({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  const supabase = await createClient();
  const { data: notifications } = await supabase
    .from("notifications")
    .select("*")
    .eq("recipient_profile_id", user!.id)
    .order("created_at", { ascending: false })
    .limit(20);

  return (
    <div className="flex min-h-screen">
      <AppSidebar items={adminNav} roleLabel={roleLabels.admin} />
      <div className="flex flex-1 flex-col">
        <AppHeader
          fullName={user!.profile.full_name}
          avatarUrl={user!.profile.avatar_url}
          roleLabel={roleLabels.admin}
          notifications={notifications ?? []}
        />
        <main id="main-content" className="flex-1 bg-muted/40 p-4 pb-20 sm:p-6 lg:pb-6">
          {children}
        </main>
      </div>
      <MobileNavigation items={adminNav} />
    </div>
  );
}
