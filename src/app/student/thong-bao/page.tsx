import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/shared/empty-state";
import { formatDateTime } from "@/lib/utils/format";
import { getCurrentUser } from "@/lib/auth/session";
import { getStudentNotifications } from "@/lib/data/student";

export const metadata: Metadata = { title: "Thông báo", robots: { index: false } };

export default async function StudentNotificationsPage() {
  const user = await getCurrentUser();
  const notifications = await getStudentNotifications(user!.id);

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6">
      <PageHeader title="Thông báo" breadcrumbs={[{ label: "Tổng quan", href: "/student" }, { label: "Thông báo" }]} />

      {notifications.length === 0 ? (
        <EmptyState title="Chưa có thông báo" />
      ) : (
        <div className="flex flex-col gap-3">
          {notifications.map((n) => {
            const content = (
              <Card key={n.id} className={n.is_read ? "" : "border-brand-royal/40"}>
                <CardContent className="flex items-start justify-between gap-3 p-4">
                  <div>
                    <p className="font-medium">{n.title}</p>
                    {n.body && <p className="text-sm text-muted-foreground">{n.body}</p>}
                    <p className="mt-1 text-xs text-muted-foreground">{formatDateTime(n.created_at)}</p>
                  </div>
                  {!n.is_read && <Badge variant="royal">Mới</Badge>}
                </CardContent>
              </Card>
            );
            return n.link ? (
              <Link key={n.id} href={n.link}>
                {content}
              </Link>
            ) : (
              content
            );
          })}
        </div>
      )}
    </div>
  );
}
