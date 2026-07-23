import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/page-header";
import { NotificationsList } from "@/components/dashboard/notifications-list";
import { getCurrentUser } from "@/lib/auth/session";
import { getNotificationsForProfile } from "@/lib/data/notifications";

export const metadata: Metadata = { title: "Thông báo", robots: { index: false } };

export default async function ParentNotificationsPage() {
  const user = await getCurrentUser();
  const notifications = await getNotificationsForProfile(user!.id);

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6">
      <PageHeader title="Thông báo" breadcrumbs={[{ label: "Tổng quan", href: "/parent" }, { label: "Thông báo" }]} />
      <NotificationsList notifications={notifications} />
    </div>
  );
}
