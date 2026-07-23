import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/shared/empty-state";
import { formatDateTime } from "@/lib/utils/format";
import type { NotificationRow } from "@/types/database";

export function NotificationsList({ notifications }: { notifications: NotificationRow[] }) {
  if (notifications.length === 0) {
    return <EmptyState title="Chưa có thông báo" />;
  }

  return (
    <div className="flex flex-col gap-3">
      {notifications.map((n) => {
        const content = (
          <Card className={n.is_read ? "" : "border-brand-royal/40"}>
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
          <div key={n.id}>{content}</div>
        );
      })}
    </div>
  );
}
