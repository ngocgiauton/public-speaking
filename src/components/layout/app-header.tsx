import { Menu } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { NotificationMenu } from "@/components/dashboard/notification-menu";
import { signOutAction } from "@/features/auth/actions";
import { markNotificationReadAction } from "@/features/notifications/actions";
import type { NotificationRow } from "@/types/database";

export function AppHeader({
  fullName,
  avatarUrl,
  roleLabel,
  notifications,
}: {
  fullName: string;
  avatarUrl?: string | null;
  roleLabel: string;
  notifications: NotificationRow[];
}) {
  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-border bg-background/95 px-4 backdrop-blur sm:px-6">
      <div className="flex items-center gap-2 lg:hidden">
        <Menu className="h-5 w-5" aria-hidden="true" />
        <span className="font-heading text-sm font-semibold">{roleLabel}</span>
      </div>
      <div className="hidden lg:block" />
      <div className="flex items-center gap-3">
        <NotificationMenu notifications={notifications} onMarkRead={markNotificationReadAction} />
        <div className="flex items-center gap-2">
          <Avatar name={fullName} src={avatarUrl} size={32} />
          <span className="hidden text-sm font-medium sm:inline">{fullName}</span>
        </div>
        <form action={signOutAction}>
          <Button type="submit" variant="outline" size="sm">
            Đăng xuất
          </Button>
        </form>
      </div>
    </header>
  );
}
